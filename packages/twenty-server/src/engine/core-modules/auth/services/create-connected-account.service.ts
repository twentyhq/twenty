import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type CreateConnectedAccountInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  provider: ConnectedAccountProvider;
  accessToken: string;
  refreshToken: string;
  accountOwnerId: string;
  scopes: string[];
  manager: WorkspaceEntityManager;
};

@Injectable()
export class CreateConnectedAccountService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async createConnectedAccount(
    input: CreateConnectedAccountInput,
  ): Promise<void> {
    const {
      workspaceId,
      connectedAccountId,
      handle,
      provider,
      accessToken,
      refreshToken,
      accountOwnerId,
      scopes,
      manager,
    } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    await connectedAccountRepository.save(
      {
        id: connectedAccountId,
        handle,
        provider,
        accessToken,
        refreshToken,
        accountOwnerId,
        scopes,
      },
      {},
      manager,
    );
  }
}
