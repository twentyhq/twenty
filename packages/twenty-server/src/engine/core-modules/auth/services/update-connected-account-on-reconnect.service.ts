import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  connectedAccount: ConnectedAccountWorkspaceEntity;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class UpdateConnectedAccountOnReconnectService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async updateConnectedAccountOnReconnect(
    input: UpdateConnectedAccountOnReconnectInput,
  ): Promise<void> {
    const {
      workspaceId,
      connectedAccountId,
      accessToken,
      refreshToken,
      scopes,
      manager,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        await connectedAccountRepository.update(
          {
            id: connectedAccountId,
          },
          {
            accessToken,
            refreshToken,
            scopes,
            authFailedAt: null,
          },
          manager,
        );
      },
    );
  }
}
