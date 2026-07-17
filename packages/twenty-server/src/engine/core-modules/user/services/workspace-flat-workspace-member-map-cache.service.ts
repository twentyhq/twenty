import { Injectable } from '@nestjs/common';

import {
  WorkspaceCacheProvider,
  type WorkspaceCacheComputeResult,
} from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { computeRowsContentHash } from 'src/engine/workspace-cache/utils/compute-rows-content-hash.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
@WorkspaceCache('flatWorkspaceMemberMaps', { localDataOnly: true })
export class WorkspaceFlatWorkspaceMemberMapCacheService extends WorkspaceCacheProvider<FlatWorkspaceMemberMaps> {
  constructor(
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatWorkspaceMemberMaps> {
    const { data } = await this.computeForCacheWithContentHash(workspaceId);

    return data;
  }

  override async computeForCacheWithContentHash(
    workspaceId: string,
  ): Promise<WorkspaceCacheComputeResult<FlatWorkspaceMemberMaps>> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps = {
          byId: {},
          idByUserId: {},
        };
        const workspaceMembers = await workspaceMemberRepository.find({
          withDeleted: true,
        });

        for (const workspaceMember of workspaceMembers) {
          flatWorkspaceMemberMaps.byId[workspaceMember.id] = workspaceMember;
          flatWorkspaceMemberMaps.idByUserId[workspaceMember.userId] =
            workspaceMember.id;
        }

        return {
          data: flatWorkspaceMemberMaps,
          contentHash: computeRowsContentHash({
            workspaceMember: workspaceMembers,
          }),
        };
      },
      buildSystemAuthContext(workspaceId),
    );
  }
}
