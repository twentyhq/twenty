import { Field, ObjectType } from '@nestjs/graphql';

import { AvailableWorkspace } from 'src/engine/core-modules/auth/dto/available-workspaces.output';

@ObjectType()
export class CheckUserExistOutput {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => [AvailableWorkspace])
  availableWorkspaces: Array<AvailableWorkspace>;

  @Field(() => Boolean)
  isEmailVerified: boolean;
}
