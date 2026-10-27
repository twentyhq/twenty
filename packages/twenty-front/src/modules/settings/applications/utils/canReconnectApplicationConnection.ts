import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';

export const canReconnectApplicationConnection = ({
  connection,
  canStartAuthorization,
}: {
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>;
  canStartAuthorization: boolean;
}): boolean =>
  canStartAuthorization && isApplicationConnectionReconnectNeeded(connection);
