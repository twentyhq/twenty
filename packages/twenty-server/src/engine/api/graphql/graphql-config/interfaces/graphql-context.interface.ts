import { YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { User } from 'src/engine/features/user/user.entity';
import { Workspace } from 'src/engine/features/workspace/workspace.entity';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: User;
  workspace?: Workspace;
}
