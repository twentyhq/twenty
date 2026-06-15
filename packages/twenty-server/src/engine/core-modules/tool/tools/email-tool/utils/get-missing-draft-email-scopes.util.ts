import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';
const MICROSOFT_SEND_SCOPE = 'Mail.Send';

// Server-side counterpart of the front-end getMissingDraftEmailScopes: returns
// the OAuth scopes that are required to draft an email but are missing from the
// connected account. SMTP/IMAP and non-OAuth providers do not require scopes.
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
    default:
      return [];
  }
};
