import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';
const MICROSOFT_SEND_SCOPE = 'Mail.Send';

// Returns the OAuth scopes needed to draft an email that the connected account
// does not currently have (empty array when nothing is missing). Google and
// Microsoft each require a specific scope; other providers (e.g. SMTP/IMAP) do
// not use OAuth scopes for drafting. The switch is exhaustive so a newly added
// provider has to be handled here explicitly.
export const getMissingDraftEmailScopes = (connectedAccount: {
  provider: ConnectedAccountProvider;
  scopes: string[] | null;
}): string[] => {
  const scopes = connectedAccount.scopes;

  switch (connectedAccount.provider) {
    case ConnectedAccountProvider.GOOGLE: {
      const hasScope =
        isDefined(scopes) && scopes.includes(GMAIL_COMPOSE_SCOPE);

      return hasScope ? [] : [GMAIL_COMPOSE_SCOPE];
    }
    case ConnectedAccountProvider.MICROSOFT: {
      const hasScope =
        isDefined(scopes) && scopes.includes(MICROSOFT_SEND_SCOPE);

      return hasScope ? [] : [MICROSOFT_SEND_SCOPE];
    }
    // Non-OAuth providers do not rely on OAuth scopes to draft emails.
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
    case ConnectedAccountProvider.EMAIL_GROUP:
    case ConnectedAccountProvider.APP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
      return [];
    default:
      return assertUnreachable(
        connectedAccount.provider,
        `Unhandled connected account provider for draft email scopes: ${connectedAccount.provider}`,
      );
  }
};
