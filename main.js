const basePath = "/";
const headerPath = `${basePath}header.html`;

const navigationMenus = {
  ja: `
    <ul class="nav_lists">
      <li class="nav_list"><a href="/index.html">HOME</a></li>
      <li class="nav_list">
        <a href="/apps/00_apps.html">APPS</a>
        <ul class="dd_lists">
          <li class="dd_list"><a href="/apps/01_mpb01.html">My電話帳</a></li>
          <li class="dd_list"><a href="/apps/03_goli01.html">GoL∞ (Infinity)</a></li>
          <li class="dd_list"><a href="/apps/02_el01.html">Edit Log</a></li>
        </ul>
      </li>
      <li class="nav_list"><a href="/about/00_about.html">ABOUT</a></li>
    </ul>`,
  en: `
    <ul class="nav_lists">
      <li class="nav_list"><a href="/@en/e_index.html">HOME</a></li>
      <li class="nav_list">
        <a href="/@en/apps/e00_apps.html">APPS</a>
        <ul class="dd_lists">
          <li class="dd_list"><a href="/@en/apps/e03_goli01.html">GoL∞ (Infinity)</a></li>
          <li class="dd_list"><a href="/@en/apps/e02_el01.html">Edit Log</a></li>
        </ul>
      </li>
      <li class="nav_list"><a href="/@en/about/e00_about.html">ABOUT</a></li>
    </ul>`
};

document.addEventListener("DOMContentLoaded", () => {
  const includeHeader = new XMLHttpRequest();
  includeHeader.open("GET", headerPath, true);
  includeHeader.onreadystatechange = function () {
    if (includeHeader.readyState !== 4) return;
    if (includeHeader.status !== 200) {
      console.error(`Failed to load header.html: ${headerPath} (status: ${includeHeader.status})`);
      return;
    }

    const header = document.querySelector("#header");
    if (!header) {
      console.error("#header element not found in DOM.");
      return;
    }

    header.insertAdjacentHTML("afterbegin", includeHeader.responseText);

    header.querySelectorAll("a, img").forEach(element => {
      const attribute = element.tagName === "A" ? "href" : "src";
      const originalPath = element.getAttribute(attribute);
      if (originalPath && !originalPath.startsWith("http") && !originalPath.startsWith("#")) {
        element.setAttribute(attribute, basePath + originalPath.replace(/^\//, ""));
      }
    });

    const nav = header.querySelector("#mobile_nav");
    const languageSwitch = header.querySelector("#language_switch");
    const hamburger = header.querySelector("#hamburger_menu");
    const pageLanguage = window.location.pathname.startsWith("/@en/") ? "en" : "ja";
    let navigationLanguage = sessionStorage.getItem("timeBirdNavigationLanguage") || pageLanguage;

    const markCurrentPage = () => {
      const currentPath = window.location.pathname;
      nav.querySelectorAll(".nav_list").forEach(item => item.classList.remove("current"));
      nav.querySelectorAll(".nav_list > a").forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        const isHome = (currentPath === "/" || currentPath.endsWith("/index.html")) && linkPath.endsWith("/index.html");
        const isCurrent = currentPath === linkPath;
        const hasCurrentChild = [...link.parentElement.querySelectorAll(".dd_list a")]
          .some(child => new URL(child.href, window.location.origin).pathname === currentPath);
        if (isHome || isCurrent || hasCurrentChild) link.parentElement.classList.add("current");
      });
    };

    const renderNavigation = language => {
      navigationLanguage = language;
      nav.innerHTML = navigationMenus[language];
      nav.setAttribute("lang", language);
      languageSwitch.textContent = language === "ja" ? "English" : "Japanese";
      languageSwitch.setAttribute("aria-label", language === "ja"
        ? "Switch navigation to English"
        : "ナビゲーションを日本語に切り替える");
      sessionStorage.setItem("timeBirdNavigationLanguage", language);
      markCurrentPage();
    };

    languageSwitch.addEventListener("click", event => {
      event.preventDefault();
      const nextLanguage = navigationLanguage === "ja" ? "en" : "ja";
      sessionStorage.setItem("timeBirdNavigationLanguage", nextLanguage);
      window.location.href = nextLanguage === "en"
        ? "/@en/e_index.html"
        : "/index.html";
    });

    const toggleMobileMenu = () => {
      const isOpen = nav.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    };
    hamburger.addEventListener("click", toggleMobileMenu);
    hamburger.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMobileMenu();
      }
    });
    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
        nav.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });

    renderNavigation(navigationLanguage);
  };
  includeHeader.send();
});
