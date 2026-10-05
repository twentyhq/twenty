import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const WORKSPACE_INVITATION_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceInvitationExceptionCode.INVITATION_ALREADY_EXIST]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceInvitationExceptionCode.USER_ALREADY_EXIST]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceInvitationExceptionCode.INVALID_INVITATION]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceInvitationExceptionCode.EMAIL_MISSING]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  WorkspaceInvitationExceptionCode,
  ExceptionCategory
>;

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
      category: WORKSPACE_INVITATION_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
