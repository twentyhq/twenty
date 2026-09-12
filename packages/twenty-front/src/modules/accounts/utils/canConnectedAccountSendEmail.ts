import { EMAIL_SENDING_PROVIDERS } from '@/accounts/constants/EmailSendingProviders';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const canConnectedAccountSendEmail = (
  account: Pick<ConnectedAccount, 'provider' | 'connectionParameters'>,
): boolean => {
  if (!EMAIL_SENDING_PROVIDERS.has(account.provider)) {
    return false;
  }

  return (
    account.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
    isDefined(account.connectionParameters?.SMTP)
  );
};
