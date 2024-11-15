import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';

@ObjectType()
export class UserExists {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => [AvailableWorkspaceOutput], { nullable: true })
  availableWorkspaces?: Array<AvailableWorkspaceOutput>;
}

@ObjectType()
class UserNotExists {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => [AvailableWorkspaceOutput], { nullable: true })
  availableWorkspaces?: Array<AvailableWorkspaceOutput>;
}

export const UserExistsOutput = createUnionType({
  name: 'UserExistsOutput',
  types: () => [UserExists, UserNotExists] as const,
  resolveType(value) {
    if (value.exists === true) {
      return UserExists;
    }

    return UserNotExists;
  },
});
