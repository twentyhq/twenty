import { type Repository } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const resolveWorkspaceMemberId = async ({
  userWorkspaceId,
  workspaceId,
  userWorkspaceRepository,
  workspaceCacheService,
}: {
  userWorkspaceId: string;
  workspaceId: string;
  userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  workspaceCacheService: WorkspaceCacheService;
}): Promise<string | null> => {
  const userWorkspace = await userWorkspaceRepository.findOne({
    where: { id: userWorkspaceId, workspaceId },
  });

  if (!isDefined(userWorkspace)) {
    return null;
  }

  const { flatWorkspaceMemberMaps } =
    await workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

  return flatWorkspaceMemberMaps.idByUserId[userWorkspace.userId] ?? null;
};
