import { Field, ObjectType } from '@nestjs/graphql';

import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';

@ObjectType()
export class CheckUserExistOutput {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => [AvailableWorkspaceOutput])
  availableWorkspaces: Array<AvailableWorkspaceOutput>;

  @Field(() => Boolean)
  isEmailVerified: boolean;
}