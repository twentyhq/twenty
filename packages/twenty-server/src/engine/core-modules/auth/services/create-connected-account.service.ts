import { Injectable } from '@nestjs/common';

import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
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
      },
    );
  }
}
