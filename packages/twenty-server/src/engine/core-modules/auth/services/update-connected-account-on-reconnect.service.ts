import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  transactionManager: EntityManager;
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
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await input.transactionManager
        .getRepository(ConnectedAccountEntity)
        .update(
          {
            id: connectedAccountId,
            workspaceId,
          },
          {
            accessToken,
            refreshToken,
            scopes,
            authFailedAt: null,
          },
        );
    }, authContext);
  }
}
