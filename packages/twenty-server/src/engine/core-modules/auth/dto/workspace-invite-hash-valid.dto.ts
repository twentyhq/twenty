import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceInviteHashValidOutput {
  @Field(() => Boolean)
  isValid: boolean;
}
