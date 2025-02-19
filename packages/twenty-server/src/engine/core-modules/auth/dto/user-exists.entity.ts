import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';

@ObjectType()
export class UserExists {
  @Field(() => Boolean)
  exists: true;

  @Field(() => [AvailableWorkspaceOutput])
  availableWorkspaces: Array<AvailableWorkspaceOutput>;

  @Field(() => Boolean)
  isEmailVerified: boolean;
}

@ObjectType()
export class UserNotExists {
  @Field(() => Boolean)
  exists: false;
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
