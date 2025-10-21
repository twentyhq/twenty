import { type YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: UserEntity;
  workspace?: WorkspaceEntity;
}
