import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceInvitationExceptionCode {
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  INVITATION_CORRUPTED = 'INVITATION_CORRUPTED',
  INVITATION_ALREADY_EXIST = 'INVITATION_ALREADY_EXIST',
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
  INVALID_INVITATION = 'INVALID_INVITATION',
  EMAIL_MISSING = 'EMAIL_MISSING',
}

const getWorkspaceInvitationExceptionUserFriendlyMessage = (
  code: WorkspaceInvitationExceptionCode,
) => {
  switch (code) {
    case WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE:
    case WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED:
    case WorkspaceInvitationExceptionCode.INVALID_INVITATION:
      return msg`There is an issue with your invitation. Please try again.`;
    case WorkspaceInvitationExceptionCode.INVITATION_ALREADY_EXIST:
      return msg`An invitation has already been sent to this email.`;
    case WorkspaceInvitationExceptionCode.USER_ALREADY_EXIST:
      return msg`This user is already a member of the workspace.`;
    case WorkspaceInvitationExceptionCode.EMAIL_MISSING:
      return msg`Email is required.`;
    default:
      assertUnreachable(code);
  }
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
        getWorkspaceInvitationExceptionUserFriendlyMessage(code),
    });
  }
}
