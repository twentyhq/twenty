import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

export const hasMissingDraftEmailScopes = (
  connectedAccount: ConnectedAccount,
): boolean => {
  const scopes = connectedAccount.scopes;

  switch (connectedAccount.provider) {
    case ConnectedAccountProvider.GOOGLE:
      return !(
        isDefined(scopes) &&
        scopes.some((scope) => scope === GMAIL_COMPOSE_SCOPE)
      );
    case ConnectedAccountProvider.MICROSOFT:
      return !(
        isDefined(scopes) &&
        scopes.some((scope) => scope === MICROSOFT_SEND_SCOPE)
      );
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return false;
    default:
      assertUnreachable(
        connectedAccount.provider,
        'Provider not yet supported for draft email actions',
      );
  }
};
