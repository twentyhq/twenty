import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationRegistrationExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED = 'UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED',
  INVALID_SCOPE = 'INVALID_SCOPE',
  INVALID_REDIRECT_URI = 'INVALID_REDIRECT_URI',
  INVALID_INPUT = 'INVALID_INPUT',
  SOURCE_CHANNEL_MISMATCH = 'SOURCE_CHANNEL_MISMATCH',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  VERSION_ALREADY_EXISTS = 'VERSION_ALREADY_EXISTS',
  SERVER_VERSION_INCOMPATIBLE = 'SERVER_VERSION_INCOMPATIBLE',
  INVALID_APP_ENGINE_REQUIREMENT = 'INVALID_APP_ENGINE_REQUIREMENT',
  INVALID_SERVER_VERSION = 'INVALID_SERVER_VERSION',
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
    case ApplicationRegistrationExceptionCode.INVALID_INPUT:
      return msg`Invalid input for application registration.`;
    case ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      return msg`The app source channel does not match the expected type.`;
    case ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND:
      return msg`Application registration variable not found.`;
    case ApplicationRegistrationExceptionCode.VERSION_ALREADY_EXISTS:
      return msg`This version is not higher than the currently deployed version. Please bump the version in package.json before deploying again.`;
    case ApplicationRegistrationExceptionCode.SERVER_VERSION_INCOMPATIBLE:
      return msg`This app requires a newer version of the Twenty server. Please upgrade your server or use a compatible app version.`;
    case ApplicationRegistrationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT:
      return msg`The app manifest declares an invalid server version requirement.`;
    case ApplicationRegistrationExceptionCode.INVALID_SERVER_VERSION:
      return msg`The server's APP_VERSION is not a valid semver version. Self-hosted instances must configure a valid APP_VERSION.`;
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
