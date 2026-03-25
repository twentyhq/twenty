import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum UserWorkspaceExceptionCode {
  USER_WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
}

const getUserWorkspaceExceptionUserFriendlyMessage = (
  code: UserWorkspaceExceptionCode,
) => {
  switch (code) {
    case UserWorkspaceExceptionCode.USER_WORKSPACE_NOT_FOUND:
      return msg`User workspace not found.`;
    default:
      assertUnreachable(code);
  }
};

export class UserWorkspaceException extends CustomException<UserWorkspaceExceptionCode> {
  constructor(
    message: string,
    code: UserWorkspaceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getUserWorkspaceExceptionUserFriendlyMessage(code),
    });
  }
}

export const UserWorkspaceNotFoundDefaultError = new UserWorkspaceException(
  'User Workspace not found',
  UserWorkspaceExceptionCode.USER_WORKSPACE_NOT_FOUND,
);
