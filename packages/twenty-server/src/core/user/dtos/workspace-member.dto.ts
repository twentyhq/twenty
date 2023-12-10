import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@ObjectType('UserWorkspaceMemberName')
export class UserWorkspaceMemberName {
  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;
}

@ObjectType('UserWorkspaceMember')
export class UserWorkspaceMember {
  @IDField(() => ID)
  id: string;

  @Field(() => UserWorkspaceMemberName)
  name: UserWorkspaceMemberName;

  @Field({ nullable: false })
  colorScheme: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field({ nullable: false })
  locale: string;
}
