import { Button } from '@/ui/components/button';
import { ThemeContext } from '@/ui/theme/context';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom/client';

const companyPattern = new MatchPattern('*://*.linkedin.com/company/*');

const StyledContainer = styled.div`
   margin: ${({theme}) => `${theme.spacing(1)} ${0} ${0} ${theme.spacing(2)}`};
`

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

    const anchor = await waitFor('[class*="org-top-card-primary-actions__inner"]');
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
            <StyledContainer>
              <Button>Add to Twenty</Button>
            </StyledContainer>
          </ThemeContext>

        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      }
    });

    ctx.addEventListener(window, 'wxt:locationchange', ({newUrl}) => {
        if(companyPattern.includes(newUrl)) ui.mount()
    })

    ui.mount();
  },
});
