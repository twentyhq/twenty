import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';

// Gates the Reconnect action only; badges use isApplicationConnectionReconnectNeeded so broken rows stay visible
export const canReconnectApplicationConnection = ({
  connection,
  isClientCredentialsConfigured,
}: {
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>;
  isClientCredentialsConfigured: boolean;
}): boolean =>
  isClientCredentialsConfigured &&
  isApplicationConnectionReconnectNeeded(connection);
