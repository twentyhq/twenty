import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';

@ObjectType('SendInvitations')
export class SendInvitationsDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;

  @Field(() => [String])
  errors: Array<string>;

  @Field(() => [WorkspaceInvitation])
  result: Array<WorkspaceInvitation>;
}
