import { NON_MAILBOX_PROVIDERS } from '@/accounts/constants/NonMailboxProviders';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
