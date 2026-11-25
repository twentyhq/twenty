import { renderLinkedinConnectPage } from 'src/logic-functions/utils/render-linkedin-connect-page.util';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectRedirect = ({
  title,
  message,
  url,
}: {
  title: string;
  message: string;
  url: string;
}): string =>
  renderLinkedinConnectPage({
    title,
    content: html`
      <p>${message}</p>
      <a id="continue" class="button" href="${url}">Continue</a>
      <script>
        window.location.replace(document.getElementById('continue').href);
      </script>
    `,
  });
