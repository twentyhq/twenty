import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum UserWorkspaceExceptionCode {
  USER_WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
}

const userWorkspaceExceptionUserFriendlyMessages: Record<
  UserWorkspaceExceptionCode,
  MessageDescriptor
> = {
  [UserWorkspaceExceptionCode.USER_WORKSPACE_NOT_FOUND]: msg`User workspace not found.`,
};

export class UserWorkspaceException extends CustomException<UserWorkspaceExceptionCode> {
  constructor(
    message: string,
    code: UserWorkspaceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? userWorkspaceExceptionUserFriendlyMessages[code],
    });
  }
}

export const UserWorkspaceNotFoundDefaultError = new UserWorkspaceException(
  'User Workspace not found',
  UserWorkspaceExceptionCode.USER_WORKSPACE_NOT_FOUND,
);
