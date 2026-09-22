import { Injectable } from '@nestjs/common';

import { type FullNameMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceProvisioned } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AdminPanelWorkspaceMemberNamesService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  // Names entered in profile settings are stored on workspaceMember; user.firstName/lastName
  // stays empty for email/password signups, so the admin panel must read them from here.
  async getNamesByUserId({
    workspaceId,
    userIds,
  }: {
    workspaceId: string;
    userIds: string[];
  }): Promise<Map<string, FullNameMetadata>> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      const workspaceMembers = await workspaceMemberRepository.find({
        where: { userId: In(userIds) },
      });

      return new Map(
        workspaceMembers.map((workspaceMember) => [
          workspaceMember.userId,
          workspaceMember.name,
        ]),
      );
    }, buildSystemAuthContext(workspaceId));
  }

  // An unprovisioned workspace has no schema yet, so querying it would throw.
  async getNamesByUserIdIfProvisioned({
    workspace,
    userIds,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'activationStatus'> | undefined;
    userIds: string[];
  }): Promise<Map<string, FullNameMetadata>> {
    if (
      !isDefined(workspace) ||
      !isWorkspaceProvisioned(workspace) ||
      userIds.length === 0
    ) {
      return new Map();
    }

    return this.getNamesByUserId({ workspaceId: workspace.id, userIds });
  }
}
