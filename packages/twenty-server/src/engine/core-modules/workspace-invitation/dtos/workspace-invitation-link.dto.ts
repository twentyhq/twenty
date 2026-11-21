import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceInvitationLink')
export class WorkspaceInvitationLinkDTO {
  @Field()
  email: string;

  @Field()
  link: string;
}
