import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';
import { type SafeHtml } from 'src/types/safe-html.type';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectStartOverLink = (
  flow: LinkedinConnectFlow,
): SafeHtml =>
  html`<p class="footnote">
    <a
      href="?flow=${encodeLinkedinConnectFlow({
        ...flow,
        pendingCheckpoint: null,
      })}"
      >Start over</a
    >
  </p>`;
