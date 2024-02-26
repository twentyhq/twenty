import { Field, ObjectType } from '@nestjs/graphql';

import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';
import { User } from 'src/core/user/user.entity';

@ObjectType()
export class CurrentUser {
  @Field(() => User)
  user: User;

  @Field(() => [UserWorkspace])
  workspaces: UserWorkspace[];
}
