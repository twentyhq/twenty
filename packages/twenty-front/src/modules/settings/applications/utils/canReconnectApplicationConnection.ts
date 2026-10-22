import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';

// Missing OAuth setup disables reconnect without hiding the failure status.
export const canReconnectApplicationConnection = ({
  connection,
  isClientCredentialsConfigured,
}: {
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>;
  isClientCredentialsConfigured: boolean;
}): boolean =>
  isClientCredentialsConfigured &&
  isApplicationConnectionReconnectNeeded(connection);
