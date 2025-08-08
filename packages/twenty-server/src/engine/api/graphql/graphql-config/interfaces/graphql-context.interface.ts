import { type YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { type User } from 'src/engine/core-modules/user/user.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: User;
  workspace?: Workspace;
}
