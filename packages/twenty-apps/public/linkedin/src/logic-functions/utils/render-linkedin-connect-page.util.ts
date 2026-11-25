import { LINKEDIN_CONNECT_PAGE_LOGO } from 'src/constants/linkedin-connect-page-logo.constant';
import { LINKEDIN_CONNECT_PAGE_STYLES } from 'src/constants/linkedin-connect-page-styles.constant';
import { type SafeHtml } from 'src/types/safe-html.type';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectPage = ({
  title,
  content,
}: {
  title: string;
  content: SafeHtml;
}): string =>
  html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <meta name="robots" content="noindex" />
        <title>${title}</title>
        ${LINKEDIN_CONNECT_PAGE_STYLES}
      </head>
      <body>
        <main>
          ${LINKEDIN_CONNECT_PAGE_LOGO}
          <h1>${title}</h1>
          ${content}
        </main>
        <script>
          document.addEventListener('submit', function (event) {
            setTimeout(function () {
              event.target
                .querySelectorAll('button')
                .forEach(function (button) {
                  button.disabled = true;
                });
            }, 0);
          });
        </script>
      </body>
    </html>`.safeHtml;
