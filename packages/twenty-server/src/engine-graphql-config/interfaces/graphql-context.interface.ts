import { YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { User } from 'src/engine/modules/user/user.entity';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: User;
  workspace?: Workspace;
}
