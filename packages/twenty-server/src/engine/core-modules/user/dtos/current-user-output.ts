import { ObjectType, Field } from '@nestjs/graphql';

import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class CurrentUserOutput extends User {
  @Field(() => Workspace)
  currentWorkspace: Workspace;
}
