import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';
import { getLinkedinConnectCodeInstruction } from 'src/logic-functions/utils/get-linkedin-connect-code-instruction.util';
import { renderLinkedinConnectError } from 'src/logic-functions/utils/render-linkedin-connect-error.util';
import { renderLinkedinConnectPage } from 'src/logic-functions/utils/render-linkedin-connect-page.util';
import { renderLinkedinConnectStartOverLink } from 'src/logic-functions/utils/render-linkedin-connect-start-over-link.util';
import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectCode = ({
  flow,
  checkpoint,
  errorMessage,
}: {
  flow: LinkedinConnectFlow;
  checkpoint: Pick<UnipileAuthCheckpoint, 'type' | 'channel' | 'platform'>;
  errorMessage?: string;
}): string =>
  renderLinkedinConnectPage({
    title: 'Enter your verification code',
    content: html`
      <p>${getLinkedinConnectCodeInstruction(checkpoint)}</p>
      ${renderLinkedinConnectError(errorMessage)}
      <form method="post" action="?" autocomplete="off">
        <input
          type="hidden"
          name="flow"
          value="${encodeLinkedinConnectFlow(flow)}"
        />
        <label for="code">Verification code</label>
        <input
          id="code"
          name="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          autofocus
        />
        <button type="submit" name="action" value="solve">Verify</button>
        ${
          checkpoint.type === 'OTP_OR_IN_APP_VALIDATION'
            ? html`<button
                type="submit"
                class="secondary"
                name="action"
                value="wait"
              >
                I approved it in the LinkedIn app
              </button>`
            : null
        }
      </form>
      ${renderLinkedinConnectStartOverLink(flow)}
    `,
  });
