import { LINKEDIN_MATCHES } from "@/common";

export default defineContentScript({
    matches: [LINKEDIN_MATCHES.BASE_URL],
    main(ctx) {
      // Define the UIa
      const ui = createIframeUi(ctx, {
        page: '/iframe.html',
        position: 'inline',
        append: 'before',
        anchor: () => {
            return document.querySelector('head') as Element;
        },
        onMount: (wrapper, iframe) => {
            Object.assign(iframe.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                border: 0,
            })
        },
      });

      ctx.addEventListener(window, 'wxt:locationchange', () => {
        ui.mount();
      });
      // Show UI to user
      ui.mount();
    },
});
