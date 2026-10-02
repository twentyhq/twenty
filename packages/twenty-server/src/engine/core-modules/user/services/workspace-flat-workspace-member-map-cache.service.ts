import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

import { FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const USER_WORKSPACE_ROWS_REQUIREMENT = {
  userWorkspace: {
    columns: ['id', 'userId'],
    where: { deletedAt: IsNull() },
  },
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('flatWorkspaceMemberMaps', {
  localDataOnly: true,
  packingPonderation: 1,
})
export class WorkspaceFlatWorkspaceMemberMapCacheService extends WorkspaceCacheProvider<FlatWorkspaceMemberMaps> {
  override readonly rowsRequirement = USER_WORKSPACE_ROWS_REQUIREMENT;

  constructor(protected readonly workspaceOrmManager: WorkspaceOrmManager) {
    super();
  }

  async computeForCache({
    workspaceId,
    rows,
  }: WorkspaceCacheProviderContext<
    typeof USER_WORKSPACE_ROWS_REQUIREMENT
  >): Promise<FlatWorkspaceMemberMaps> {
    const flatWorkspaceMemberMaps =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps = {
          byId: {},
          idByUserId: {},
          idByUserWorkspaceId: {},
          userWorkspaceIdByUserId: {},
        };
        const workspaceMembers = await workspaceMemberRepository.find({
          withDeleted: true,
        });

        for (const workspaceMember of workspaceMembers) {
          flatWorkspaceMemberMaps.byId[workspaceMember.id] = workspaceMember;
          flatWorkspaceMemberMaps.idByUserId[workspaceMember.userId] =
            workspaceMember.id;
        }

        return flatWorkspaceMemberMaps;
      }, buildSystemAuthContext(workspaceId));

    for (const userWorkspace of rows.userWorkspace) {
      const workspaceMemberId =
        flatWorkspaceMemberMaps.idByUserId[userWorkspace.userId];

      flatWorkspaceMemberMaps.userWorkspaceIdByUserId[userWorkspace.userId] =
        userWorkspace.id;

      if (isDefined(workspaceMemberId)) {
        flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspace.id] =
          workspaceMemberId;
      }
    }

    return flatWorkspaceMemberMaps;
  }
}
