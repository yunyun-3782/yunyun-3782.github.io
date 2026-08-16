// 工具函数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function checkBackParam() {
    const back = getUrlParam('back');
    if (back) {
        try { window.location.href = decodeURIComponent(back); } catch (e) {}
    }
}

// 清理友链 rel 属性（去掉 nofollow 和 sponsored）
function initCleanFriendLinks() {
    const links = document.querySelectorAll('.footer-links a[rel]');
    for (var i = 0; i < links.length; i++) {
        var newRel = links[i].rel
            .replace(/\b(nofollow|sponsored)\b/g, '')
            .trim()
            .replace(/\s+/g, ' ');
        if (newRel) {
            links[i].rel = newRel;
        } else {
            links[i].removeAttribute('rel');
        }
    }
}

// 打字机效果
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    
    const text = '虚舟实验室是专注于编程领域创新的「青少年编程团队」，探未来之境 · 载无界新生';
    el.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 45 + Math.random() * 30);
        }
    }
    
    setTimeout(type, 1400);
}

// 计数器动画
function animateCounters() {
    const counters = document.querySelectorAll('.data-number');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            
            counter.style.animation = 'pulse 0.6s infinite alternate';
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                counter.textContent = Math.floor(easeProgress * target);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = target;
                    counter.style.animation = 'none';
                }
            };
            
            requestAnimationFrame(animate);
            observer.unobserve(counter);
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counter.textContent = '0';
        observer.observe(counter);
    });
}

// 时间线拖动（带惯性滚动，已删除滚轮劫持）
function initTimelineDrag() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let lastX;
    let lastTime;
    let rafId;

    const handleStart = (x) => {
        isDown = true;
        timeline.classList.add('active');
        startX = x;
        lastX = x;
        lastTime = Date.now();
        scrollLeft = timeline.scrollLeft;
        velocity = 0;
        cancelAnimationFrame(rafId);
    };

    const handleEnd = () => {
        isDown = false;
        timeline.classList.remove('active');
        if (Math.abs(velocity) > 0.5) {
            momentumScroll();
        }
    };

    const handleMove = (x) => {
        if (!isDown) return;
        const now = Date.now();
        const dt = now - lastTime;
        const dx = x - lastX;
        
        if (dt > 0) {
            velocity = dx / dt * 16;
        }
        
        lastX = x;
        lastTime = now;
        
        const walk = (x - startX) * 1.5;
        timeline.scrollLeft = scrollLeft - walk;
    };

    function momentumScroll() {
        if (Math.abs(velocity) < 0.5) return;
        
        timeline.scrollLeft -= velocity;
        velocity *= 0.95;
        rafId = requestAnimationFrame(momentumScroll);
    }

    timeline.addEventListener('mousedown', (e) => {
        handleStart(e.pageX);
        e.preventDefault();
    });
    timeline.addEventListener('mouseleave', handleEnd);
    timeline.addEventListener('mouseup', handleEnd);
    timeline.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        handleMove(e.pageX);
    });

    timeline.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        handleStart(touch.pageX);
    }, { passive: true });

    timeline.addEventListener('touchend', handleEnd);
    timeline.addEventListener('touchcancel', handleEnd);
    timeline.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const touch = e.touches[0];
        handleMove(touch.pageX);
    }, { passive: true });
    
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
                
                const navMenu = document.getElementById('navMenu');
                if (navMenu && navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                }
            }
        });
    });
}

// 滚动显示动画
function initRevealAnimation() {
    const selectors = '.news-card, .about-content p, .quick-link, .timeline-item, .product-card, .member-card, .footer-section';
    document.querySelectorAll(selectors).forEach((el, i) => {
        el.classList.add('reveal');
        el.classList.add(`reveal-delay-${(i % 4) + 1}`);
    });
    
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// 鼠标光晕（桌面端）
function initMouseGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);
    
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let visible = false;
    let inactivityTimer;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!visible) {
            visible = true;
            glow.style.opacity = '1';
        }
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            visible = false;
            glow.style.opacity = '0';
        }, 3000);
    });
    
    function animate() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// 卡片鼠标跟随光效
function initCardGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    document.querySelectorAll('.member-card, .product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// 导航栏滚动行为
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (!navbar) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScroll = window.scrollY;
                
                if (currentScroll > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                if (currentScroll > lastScroll && currentScroll > 200) {
                    navbar.classList.add('hidden');
                } else {
                    navbar.classList.remove('hidden');
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }
}

// 返回顶部
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 600) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 本地统计
function initLocalStats() {
    const storageKey = 'caellab_visits';
    const today = new Date().toDateString();
    const visitorId = Math.random().toString(36).substring(2, 15);

    let stats = JSON.parse(localStorage.getItem(storageKey)) || {
        total: 0,
        unique: [],
        daily: {}
    };

    stats.total++;
    if (!stats.daily[today]) stats.daily[today] = 0;
    stats.daily[today]++;

    if (!stats.unique.includes(visitorId)) {
        stats.unique.push(visitorId);
    }

    localStorage.setItem(storageKey, JSON.stringify(stats));

    const todayEl = document.getElementById('visit-today');
    const totalEl = document.getElementById('visit-total');
    const uniqueEl = document.getElementById('visit-unique');
    
    if (todayEl) todayEl.textContent = stats.daily[today];
    if (totalEl) totalEl.textContent = stats.total;
    if (uniqueEl) uniqueEl.textContent = stats.unique.length;
}

// 页面加载动画（已优化：复访减少等待，6小时内逐渐恢复到原值）
function initLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    loader.style.display = 'flex';
    
    // === Cookie 工具函数 ===
    function setCookie(name, value, hours) {
        const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
    
    // === 计算等待时间 ===
    const SIX_HOURS = 6 * 60 * 60 * 1000;  // 6小时 = 21,600,000ms
    const MAX_DELAY = 800;                    // 原始等待时间
    const MIN_DELAY = 100;                    // 最小等待时间（复访立即回来）
    
    let delay = MAX_DELAY;  // 默认：首次访问用原始等待
    
    const lastVisit = getCookie('caellab_last_visit');
    
    if (lastVisit) {
        const elapsed = Date.now() - parseInt(lastVisit, 10);
        
        if (elapsed < SIX_HOURS) {
            // 6小时内：从 MIN_DELAY 线性增加到 MAX_DELAY
            const ratio = elapsed / SIX_HOURS;
            delay = Math.round(MIN_DELAY + (MAX_DELAY - MIN_DELAY) * ratio);
        }
        // 超过6小时：delay 保持 MAX_DELAY
    }
    
    // 记录本次访问时间（每次访问都更新）
    setCookie('caellab_last_visit', Date.now().toString(), 24 * 15); // 保存7天
    
    // 执行加载动画
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
    }, delay);
}

// 时间线自动居中最近项目
function initTimelineCenter() {
    const timeline = document.querySelector('.timeline');
    const items = document.querySelectorAll('.timeline-item');
    if (!timeline || items.length < 2) return;
    
    const targetItem = items[items.length - 2];
    setTimeout(() => {
        timeline.scrollLeft = targetItem.offsetLeft - timeline.clientWidth + targetItem.clientWidth + 40;
    }, 100);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initConsoleArt(); 
    checkBackParam();
    initNavbar();
    initTypewriter();
    animateCounters();
    initTimelineDrag();
    initTimelineCenter();
    initSmoothScroll();
    initRevealAnimation();
    initMouseGlow();
    initCardGlow();
    initBackToTop();
    initLocalStats();
    initThemeToggle();
    initCleanFriendLinks();  // ← 新增：清理友链 rel

});

function initConsoleArt() {
  // 主视觉
  console.log(
    `%c
╔══════════════════════════════════════╗
║                                      ║
║        ⚡ 虚舟实验室 ⚡              ║
║                                      ║
║      探未来之境 · 载无界新生         ║
║                                      ║
║            caellab.com               ║
║                                      ║
╚══════════════════════════════════════╝
    `,
    `color: #00b0ff;
     font-family: 'Segoe UI', monospace, sans-serif;
     font-size: 14px;
     line-height: 1.6;
     text-shadow: 0 0 10px rgba(0,176,255,0.3);`
  );

  // 招聘函
  console.log(
    `%c
┌──────────────────────────────────────┐
│                                      │
│   致发现此处的开发者：                  │
│                                      │
│   你好，很高兴你愿意深入页面底层，       │
│   看见我们藏在代码里的邀约。             │
│                                      │
│   虚舟实验室是由中学生组建的青少年编程    │
│   团队，深耕网页、启动器、知识库项目。   │
│                                      │
│   如果你满足以下任意条件，我们诚挚发出    │
│   团队邀请函：                          │
│                                      │
│   • 熟悉 HTML/CSS/JS，能独立制作官网    │
│   • 掌握 Java/JS/Python，有开源作品     │
│   • 擅长社区运维、Wiki、服务器配置       │
│   • 热爱编程，愿和同龄人长期开发开源项目  │
│                                      │
│   我们能提供：                          │
│                                      │
│   • GPCL 启动器、轻之舟百科等项目实践    │
│   • 同龄人技术交流圈，无年龄代沟         │
│   • 作品署名，开源项目永久留存贡献记录    │
│                                      │
│   投递方式：                            │
│   前往论坛 xmuer.online 发布自荐帖！    │
│                                      │
│   探未来之境，载无界新生 —— 期待同行。   │
│                                      │
└──────────────────────────────────────┘
    `,
    `color: #00e5ff;
     font-family: 'Segoe UI', monospace, sans-serif;
     font-size: 12px;
     line-height: 1.5;`
  );

  // 随机语录
  const quotes = [
    '探索未知，创造可能 — 云云',
    '同学，注释还有小彩蛋奥！',//怎么可能？骗你的嘿嘿
    'if(坚持== true){成功.compile();} — Marko',
    'Godot 启动！ — 倒反天狗',
    '行胜于言! — Maxkore',
    '此生不悔入MC，来世还做方块人。 — HIMH'
  ];
  console.log(
    `%c💬 ${quotes[Math.floor(Math.random() * quotes.length)]}`,
    `color: #78909c; font-size: 11px; font-style: italic;`
  );
}

// 主题切换
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // 检查用户偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 设置初始主题
    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // 添加点击事件
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon(currentTheme);
    });
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            updateThemeIcon(currentTheme);
        }
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
}
