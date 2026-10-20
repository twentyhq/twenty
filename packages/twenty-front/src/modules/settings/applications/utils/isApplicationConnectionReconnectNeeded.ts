import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isDefined } from 'twenty-shared/utils';

// Disconnecting or transferring a connection archives it and drops its tokens
export const isApplicationConnectionReconnectNeeded = (
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>,
): boolean =>
  isDefined(connection.authFailedAt) || isDefined(connection.archivedAt);
