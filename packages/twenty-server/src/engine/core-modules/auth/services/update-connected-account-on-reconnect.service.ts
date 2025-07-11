import { Injectable } from '@nestjs/common';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
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
  }
}
