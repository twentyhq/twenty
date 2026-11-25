import { renderLinkedinConnectPage } from 'src/logic-functions/utils/render-linkedin-connect-page.util';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectExpired = (): string =>
  renderLinkedinConnectPage({
    title: 'This sign-in link has expired',
    content: html`<p>
      Go back to Twenty and connect your LinkedIn account again.
    </p>`,
  });
