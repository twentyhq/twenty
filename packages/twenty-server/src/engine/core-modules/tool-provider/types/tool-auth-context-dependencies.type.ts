import { type Repository } from 'typeorm';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ToolAuthContextDependencies = {
  userRepository: Pick<Repository<UserEntity>, 'findOne'>;
  userWorkspaceRepository: Pick<Repository<UserWorkspaceEntity>, 'findOne'>;
  workspaceCacheService: Pick<WorkspaceCacheService, 'getOrRecompute'>;
};
