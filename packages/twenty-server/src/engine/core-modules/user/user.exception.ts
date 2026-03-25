import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum UserExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  EMAIL_UNCHANGED = 'EMAIL_UNCHANGED',
  EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE = 'EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE',
}

const getUserExceptionUserFriendlyMessage = (code: UserExceptionCode) => {
  switch (code) {
    case UserExceptionCode.USER_NOT_FOUND:
      return msg`User not found.`;
    case UserExceptionCode.EMAIL_ALREADY_IN_USE:
      return msg`This email is already in use.`;
    case UserExceptionCode.EMAIL_UNCHANGED:
      return msg`Email is unchanged.`;
    case UserExceptionCode.EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE:
      return msg`Email update is restricted to single workspace users.`;
    default:
      assertUnreachable(code);
  }
};

export class UserException extends CustomException<UserExceptionCode> {
  constructor(
    message: string,
    code: UserExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getUserExceptionUserFriendlyMessage(code),
    });
  }
}
