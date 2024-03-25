import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceInviteHashValid {
  @Field(() => Boolean)
  isValid: boolean;
}
