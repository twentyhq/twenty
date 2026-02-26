import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum AppRegistrationExceptionCode {
  APP_REGISTRATION_NOT_FOUND = 'APP_REGISTRATION_NOT_FOUND',
  UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED = 'UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED',
  CLIENT_ID_ALREADY_EXISTS = 'CLIENT_ID_ALREADY_EXISTS',
  INVALID_SCOPE = 'INVALID_SCOPE',
  INVALID_REDIRECT_URI = 'INVALID_REDIRECT_URI',
  INVALID_INPUT = 'INVALID_INPUT',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
}

const getExceptionUserFriendlyMessage = (
  code: AppRegistrationExceptionCode,
) => {
  switch (code) {
    case AppRegistrationExceptionCode.APP_REGISTRATION_NOT_FOUND:
      return msg`App registration not found.`;
    case AppRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED:
      return msg`This universal identifier is already claimed by another registration.`;
    case AppRegistrationExceptionCode.CLIENT_ID_ALREADY_EXISTS:
      return msg`This client ID already exists.`;
    case AppRegistrationExceptionCode.INVALID_SCOPE:
      return msg`One or more requested scopes are invalid.`;
    case AppRegistrationExceptionCode.INVALID_REDIRECT_URI:
      return msg`One or more redirect URIs are invalid.`;
    case AppRegistrationExceptionCode.INVALID_INPUT:
      return msg`Invalid input provided.`;
    case AppRegistrationExceptionCode.VARIABLE_NOT_FOUND:
      return msg`App registration variable not found.`;
    default:
      assertUnreachable(code);
  }
};

export class AppRegistrationException extends CustomException<AppRegistrationExceptionCode> {
  constructor(
    message: string,
    code: AppRegistrationExceptionCode,
    {
      userFriendlyMessage,
    }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getExceptionUserFriendlyMessage(code),
    });
  }
}
