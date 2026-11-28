import { type InteractiveConnectionScreen } from 'twenty-shared/application';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';

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
  pendingCompletion: {
    externalAccountId: string;
    handle: string | null;
    encryptedAccessToken: EncryptedString | null;
  } | null;
};
