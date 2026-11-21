import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceInvitationLinkDTO } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation-link.dto';
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

  @Field(() => [WorkspaceInvitationLinkDTO], {
    description:
      'Links to share with the invitees, only returned to callers with the roles permission when invitation link sharing is enabled',
  })
  inviteLinks: Array<WorkspaceInvitationLinkDTO>;
}
