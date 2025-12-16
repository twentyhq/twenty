import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceInvitationExceptionCode {
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  INVITATION_CORRUPTED = 'INVITATION_CORRUPTED',
  INVITATION_ALREADY_EXIST = 'INVITATION_ALREADY_EXIST',
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
  INVALID_INVITATION = 'INVALID_INVITATION',
  EMAIL_MISSING = 'EMAIL_MISSING',
}

const workspaceInvitationExceptionUserFriendlyMessages: Record<
  WorkspaceInvitationExceptionCode,
  MessageDescriptor
> = {
  [WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE]: msg`Invalid token type.`,
  [WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED]: msg`Invitation is corrupted.`,
  [WorkspaceInvitationExceptionCode.INVITATION_ALREADY_EXIST]: msg`An invitation has already been sent to this email.`,
  [WorkspaceInvitationExceptionCode.USER_ALREADY_EXIST]: msg`This user is already a member of the workspace.`,
  [WorkspaceInvitationExceptionCode.INVALID_INVITATION]: msg`Invalid invitation.`,
  [WorkspaceInvitationExceptionCode.EMAIL_MISSING]: msg`Email is required.`,
};

export class WorkspaceInvitationException extends CustomException<WorkspaceInvitationExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceInvitationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceInvitationExceptionUserFriendlyMessages[code],
    });
  }
}
