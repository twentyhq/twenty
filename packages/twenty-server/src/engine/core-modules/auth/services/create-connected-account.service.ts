import { Injectable } from '@nestjs/common';

import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

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
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.connectedAccountDataAccessService.save(
        workspaceId,
        {
          id: connectedAccountId,
          handle,
          provider,
          accessToken,
          refreshToken,
          accountOwnerId,
          scopes,
        },
        manager,
      );
    }, authContext);
  }
}
