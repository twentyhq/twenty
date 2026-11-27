import { type InteractiveConnectionScreen } from 'twenty-shared/application';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';

export type InteractiveConnectionFlowSession = {
  connectionProviderId: string;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  scope: ConnectionProviderEntity['scope'];
  reconnectingConnectedAccountId: string | null;
  createdAtMs: number;
  submitCount: number;
  screenType: InteractiveConnectionScreen['type'];
  fieldKeys: string[];
  state: Record<string, unknown>;
};
