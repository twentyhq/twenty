import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationRegistrationExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED = 'UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED',
  INVALID_SCOPE = 'INVALID_SCOPE',
  INVALID_REDIRECT_URI = 'INVALID_REDIRECT_URI',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
}

const getExceptionUserFriendlyMessage = (
  code: ApplicationRegistrationExceptionCode,
) => {
  switch (code) {
    case ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      return msg`Application registration not found.`;
    case ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED:
      return msg`This universal identifier is already claimed by another registration.`;
    case ApplicationRegistrationExceptionCode.INVALID_SCOPE:
      return msg`One or more requested scopes are invalid.`;
    case ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI:
      return msg`One or more redirect URIs are invalid.`;
    case ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND:
      return msg`Application registration variable not found.`;
    default:
      assertUnreachable(code);
  }
};

export class ApplicationRegistrationException extends CustomException<ApplicationRegistrationExceptionCode> {
  constructor(
    message: string,
    code: ApplicationRegistrationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getExceptionUserFriendlyMessage(code),
    });
  }
}
