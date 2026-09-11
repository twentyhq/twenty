import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { canConnectedAccountPerformEmailOperation } from 'twenty-shared/utils';

export const canConnectedAccountSendEmail = (
  account: Pick<ConnectedAccount, 'provider' | 'connectionParameters'>,
): boolean =>
  canConnectedAccountPerformEmailOperation({
    connectedAccount: account,
    operation: 'SEND',
  });
