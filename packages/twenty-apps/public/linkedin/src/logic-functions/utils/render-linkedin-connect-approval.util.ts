import { isNonEmptyString } from '@sniptt/guards';

import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';
import { renderLinkedinConnectPage } from 'src/logic-functions/utils/render-linkedin-connect-page.util';
import { renderLinkedinConnectStartOverLink } from 'src/logic-functions/utils/render-linkedin-connect-start-over-link.util';
import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectApproval = ({
  flow,
  checkpoint,
}: {
  flow: LinkedinConnectFlow;
  checkpoint: Pick<UnipileAuthCheckpoint, 'type' | 'code'>;
}): string =>
  renderLinkedinConnectPage({
    title:
      checkpoint.type === 'LOADING' ? 'Signing you in' : 'Approve the sign-in',
    content: html`
      <p>
        ${
          checkpoint.type === 'LOADING'
            ? 'LinkedIn is finishing the sign-in. This can take a few seconds.'
            : 'Open the LinkedIn app on your phone and approve the sign-in.'
        }
      </p>
      ${
        isNonEmptyString(checkpoint.code)
          ? html`<p>
              When the app asks for a number, pick
              <strong>${checkpoint.code}</strong>.
            </p>`
          : null
      }
      <div class="spinner" role="status" aria-label="Waiting"></div>
      <form id="approval" method="post" action="?">
        <input
          type="hidden"
          name="flow"
          value="${encodeLinkedinConnectFlow(flow)}"
        />
        <input type="hidden" name="action" value="wait" />
        <noscript><button type="submit">Check again</button></noscript>
      </form>
      <script>
        setTimeout(function () {
          document.getElementById('approval').submit();
        }, 1000);
      </script>
      ${renderLinkedinConnectStartOverLink(flow)}
    `,
  });
