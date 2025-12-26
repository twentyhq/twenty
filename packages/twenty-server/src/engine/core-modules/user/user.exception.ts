import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum UserExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  EMAIL_UNCHANGED = 'EMAIL_UNCHANGED',
  EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE = 'EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE',
}

const userExceptionUserFriendlyMessages: Record<
  UserExceptionCode,
  MessageDescriptor
> = {
  [UserExceptionCode.USER_NOT_FOUND]: msg`User not found.`,
  [UserExceptionCode.EMAIL_ALREADY_IN_USE]: msg`This email is already in use.`,
  [UserExceptionCode.EMAIL_UNCHANGED]: msg`Email is unchanged.`,
  [UserExceptionCode.EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE]: msg`Email update is restricted to single workspace users.`,
};

export class UserException extends CustomException<UserExceptionCode> {
  constructor(
    message: string,
    code: UserExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? userExceptionUserFriendlyMessages[code],
    });
  }
}
