import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

import { FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { buildFlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/utils/build-flat-workspace-member-maps.util';
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
    const workspaceMembers =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
              shouldBypassPermissionChecks: true,
            })
            .find({ withDeleted: true }),
        buildSystemAuthContext(workspaceId),
      );

    return buildFlatWorkspaceMemberMaps({
      workspaceMembers,
      userWorkspaces: rows.userWorkspace,
    });
  }
}
