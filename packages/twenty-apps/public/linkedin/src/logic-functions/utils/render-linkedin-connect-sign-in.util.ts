import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';
import { renderLinkedinConnectError } from 'src/logic-functions/utils/render-linkedin-connect-error.util';
import { renderLinkedinConnectPage } from 'src/logic-functions/utils/render-linkedin-connect-page.util';
import { html } from 'src/utils/html.util';

export const renderLinkedinConnectSignIn = ({
  flow,
  username,
  errorMessage,
}: {
  flow: LinkedinConnectFlow;
  username?: string;
  errorMessage?: string;
}): string =>
  renderLinkedinConnectPage({
    title: 'Sign in to LinkedIn',
    content: html`
      <p>
        Connect your LinkedIn account to bring its conversations into Twenty.
      </p>
      ${renderLinkedinConnectError(errorMessage)}
      <form method="post" action="?" autocomplete="off">
        <input
          type="hidden"
          name="flow"
          value="${encodeLinkedinConnectFlow({
            ...flow,
            pendingCheckpoint: null,
          })}"
        />
        <label for="username">Email or phone</label>
        <input
          id="username"
          name="username"
          type="text"
          value="${username}"
          required
          autofocus
        />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Sign in</button>
      </form>
      <p class="footnote">
        Your credentials are sent to LinkedIn through Unipile, our connection
        provider. Twenty does not store your password.
      </p>
    `,
  });
