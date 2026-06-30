import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceInviteHashValid')
export class WorkspaceInviteHashValidDTO {
  @Field(() => Boolean)
  isValid: boolean;
}
