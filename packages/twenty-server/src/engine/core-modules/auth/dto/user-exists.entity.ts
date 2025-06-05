import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckUserExistOutput {
  @Field(() => Boolean)
  exists: boolean;

  @Field(() => Number)
  availableWorkspacesCount: number;

  @Field(() => Boolean)
  isEmailVerified: boolean;
}
