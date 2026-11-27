import { type Repository } from 'typeorm';

import { type AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const PROVIDER_ID = 'provider-id';
const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

describe('ConnectionProviderConnectedAccountService.assertCanAddConnectionOrThrow', () => {
  const exists = jest.fn();

  const service = new ConnectionProviderConnectedAccountService(
    {} as ConnectedAccountTokenEncryptionService,
    {} as AppConnectionAccessService,
    { exists } as unknown as Repository<ConnectedAccountEntity>,
    {} as Repository<UserEntity>,
    {} as WorkspaceEventEmitter,
    {} as BillingSubscriptionUpdateService,
  );

  const singleConnectionProvider = {
    id: PROVIDER_ID,
    allowMultipleConnections: false,
  };

  beforeEach(() => {
    exists.mockReset();
  });

  it('lets any number of connections through when the provider allows it', async () => {
    await service.assertCanAddConnectionOrThrow({
      provider: { id: PROVIDER_ID, allowMultipleConnections: true },
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      scope: 'USER',
      reconnectingConnectedAccountId: null,
    });

    expect(exists).not.toHaveBeenCalled();
  });

  it('lets a reconnect through', async () => {
    await service.assertCanAddConnectionOrThrow({
      provider: singleConnectionProvider,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      scope: 'USER',
      reconnectingConnectedAccountId: 'connected-account-id',
    });

    expect(exists).not.toHaveBeenCalled();
  });

  it("refuses a second connection for the member's USER provider", async () => {
    exists.mockResolvedValue(true);

    await expect(
      service.assertCanAddConnectionOrThrow({
        provider: singleConnectionProvider,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        scope: 'USER',
        reconnectingConnectedAccountId: null,
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.MULTIPLE_CONNECTIONS_NOT_ALLOWED,
    });

    expect(exists).toHaveBeenCalledWith({
      where: {
        connectionProviderId: PROVIDER_ID,
        workspaceId: WORKSPACE_ID,
        scope: 'USER',
        userWorkspaceId: USER_WORKSPACE_ID,
      },
    });
  });

  it('counts WORKSPACE connections across members', async () => {
    exists.mockResolvedValue(false);

    await service.assertCanAddConnectionOrThrow({
      provider: singleConnectionProvider,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      scope: 'WORKSPACE',
      reconnectingConnectedAccountId: null,
    });

    expect(exists).toHaveBeenCalledWith({
      where: {
        connectionProviderId: PROVIDER_ID,
        workspaceId: WORKSPACE_ID,
        scope: 'WORKSPACE',
      },
    });
  });
});
