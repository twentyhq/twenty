import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { EntityManager, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type CreateConnectedAccountInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  provider: ConnectedAccountProvider;
  accessToken: string;
  refreshToken: string;
  accountOwnerId: string;
  scopes: string[];
  transactionManager: EntityManager;
};

@Injectable()
export class CreateConnectedAccountService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
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
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceContext = getWorkspaceContext();
      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext,
        userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
        apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      });

      const workspaceMemberRepo =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
          rolePermissionConfig ?? undefined,
        );

      const member = await workspaceMemberRepo.findOne({
        where: { id: accountOwnerId },
      });

      if (!member) {
        throw new Error(
          `Workspace member not found for accountOwnerId ${accountOwnerId}`,
        );
      }

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { userId: member.userId, workspaceId },
      });

      if (!userWorkspace) {
        throw new Error(
          `User workspace not found for user ${member.userId} in workspace ${workspaceId}`,
        );
      }

      const userWorkspaceId = userWorkspace.id;

      await input.transactionManager
        .getRepository(ConnectedAccountEntity)
        .save({
          id: connectedAccountId,
          handle,
          provider,
          accessToken,
          refreshToken,
          userWorkspaceId,
          scopes,
          workspaceId,
        } as ConnectedAccountEntity);
    }, authContext);
  }
}
