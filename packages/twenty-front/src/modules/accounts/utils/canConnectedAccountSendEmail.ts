import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Identity (oidc, saml) and application (app) connections are stored as connected
// accounts too, and the server rejects them as senders.
const NON_MAILBOX_PROVIDERS: ConnectedAccountProvider[] = [
  ConnectedAccountProvider.OIDC,
  ConnectedAccountProvider.SAML,
  ConnectedAccountProvider.APP,
];

export const canConnectedAccountSendEmail = (
  account: Pick<ConnectedAccount, 'provider' | 'connectionParameters'>,
): boolean => {
  if (NON_MAILBOX_PROVIDERS.includes(account.provider)) {
    return false;
  }

  return (
    account.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
    isDefined(account.connectionParameters?.SMTP)
  );
};
