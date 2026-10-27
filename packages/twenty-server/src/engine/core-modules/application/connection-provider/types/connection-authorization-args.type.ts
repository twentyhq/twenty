import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';

export type ConnectionAuthorizationArgs = {
  connectionProvider: ConnectionProviderEntity;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
};
