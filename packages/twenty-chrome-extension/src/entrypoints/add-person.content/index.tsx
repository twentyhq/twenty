import { Button } from '@/ui/components/button';
import { ThemeContext } from '@/ui/theme/context';
import ReactDOM from 'react-dom/client';

const personPattern = new MatchPattern('*://*.linkedin.com/in/*');

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_end',
  async main(ctx) {

    async function waitFor(sel: string) {
        return new Promise<Element>((resolve) => {
          const tryFind = () => {
            const el = document.querySelector(sel) as Element;
            if (el) return resolve(el);
            requestAnimationFrame(tryFind);
          };
          tryFind();
        });
    }

    const anchor = await waitFor('[class$="pv-top-card-v2-ctas__custom"]');
    const ui = await createIntegratedUi(ctx, {
      position: 'inline',
      anchor,
      append:'last',
      onMount: (container) => {
        const app = document.createElement('div');
        container.append(app);

        const root = ReactDOM.createRoot(app);
        root.render(
          <ThemeContext>
              <Button>Add to Twenty</Button>
          </ThemeContext>

        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      }
    });

    ctx.addEventListener(window, 'wxt:locationchange', ({newUrl}) => {
        if(personPattern.includes(newUrl)) ui.mount()
    })

    ui.mount();
  },
});
