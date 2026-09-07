import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const canConnectedAccountSendEmail = (
  account: Pick<ConnectedAccount, 'provider' | 'connectionParameters'>,
): boolean =>
  account.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
  isDefined(account.connectionParameters?.SMTP);
