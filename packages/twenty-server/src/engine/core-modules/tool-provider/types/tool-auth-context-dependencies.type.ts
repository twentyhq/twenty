import { type Repository } from 'typeorm';

import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ToolAuthContextDependencies = {
  userRepository: Pick<Repository<UserEntity>, 'findOne'>;
  workspaceCacheService: Pick<WorkspaceCacheService, 'getOrRecompute'>;
};
