import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isDefined } from 'twenty-shared/utils';

// Ownership transfer archives a row without clearing authFailedAt; an archived credential is not the caller's to revive
export const isApplicationConnectionReconnectNeeded = (
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>,
): boolean =>
  isDefined(connection.authFailedAt) && !isDefined(connection.archivedAt);
