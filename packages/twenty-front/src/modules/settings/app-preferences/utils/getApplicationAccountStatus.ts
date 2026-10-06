import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isDefined } from 'twenty-shared/utils';

export type ApplicationAccountStatus =
  | 'CONNECTED'
  | 'RECONNECT_NEEDED'
  | 'DISCONNECTED';

// An account connected through an app's own OAuth provider has no sync
// channel: its state is the credential's. A disconnect archives the account
// and may clear its auth failure, so archivedAt is checked first.
export const getApplicationAccountStatus = (
  account: Pick<ConnectedAccount, 'archivedAt' | 'authFailedAt'>,
): ApplicationAccountStatus => {
  if (isDefined(account.archivedAt)) {
    return 'DISCONNECTED';
  }

  if (isDefined(account.authFailedAt)) {
    return 'RECONNECT_NEEDED';
  }

  return 'CONNECTED';
};
