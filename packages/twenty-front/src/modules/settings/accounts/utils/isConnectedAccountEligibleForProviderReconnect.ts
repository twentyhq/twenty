import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isConnectedAccountEligibleForProviderReconnect = (
  account: ConnectedAccount,
): boolean =>
  (account.provider === ConnectedAccountProvider.GOOGLE ||
    account.provider === ConnectedAccountProvider.MICROSOFT) &&
  (isDefined(account.authFailedAt) || isDefined(account.archivedAt));
