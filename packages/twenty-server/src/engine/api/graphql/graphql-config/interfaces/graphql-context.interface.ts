import { type YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: FlatAuthContextUser;
  workspace?: FlatWorkspace;
}
