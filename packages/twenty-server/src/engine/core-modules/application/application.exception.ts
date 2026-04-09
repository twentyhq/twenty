import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationExceptionCode {
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  FRONT_COMPONENT_NOT_FOUND = 'FRONT_COMPONENT_NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  APP_NOT_INSTALLED = 'APP_NOT_INSTALLED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_INPUT = 'INVALID_INPUT',
  SOURCE_CHANNEL_MISMATCH = 'SOURCE_CHANNEL_MISMATCH',
  PACKAGE_RESOLUTION_FAILED = 'PACKAGE_RESOLUTION_FAILED',
  TARBALL_EXTRACTION_FAILED = 'TARBALL_EXTRACTION_FAILED',
  UPGRADE_FAILED = 'UPGRADE_FAILED',
  APP_ALREADY_INSTALLED = 'APP_ALREADY_INSTALLED',
  CANNOT_DOWNGRADE_APPLICATION = 'CANNOT_DOWNGRADE_APPLICATION',
}

const getApplicationExceptionUserFriendlyMessage = (
  code: ApplicationExceptionCode,
) => {
  switch (code) {
    case ApplicationExceptionCode.OBJECT_NOT_FOUND:
      return msg`Object not found.`;
    case ApplicationExceptionCode.FIELD_NOT_FOUND:
      return msg`Field not found.`;
    case ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Logic function not found.`;
    case ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND:
      return msg`Front component not found.`;
    case ApplicationExceptionCode.ENTITY_NOT_FOUND:
      return msg`Entity not found.`;
    case ApplicationExceptionCode.APPLICATION_NOT_FOUND:
      return msg`Application not found.`;
    case ApplicationExceptionCode.APP_NOT_INSTALLED:
      return msg`Application is not installed in this workspace. Install it first.`;
    case ApplicationExceptionCode.FORBIDDEN:
      return msg`You do not have permission to perform this action.`;
    case ApplicationExceptionCode.INVALID_INPUT:
      return msg`Invalid input provided.`;
    case ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      return msg`Source channel mismatch.`;
    case ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED:
      return msg`Unable to retrieve the application package.`;
    case ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED:
      return msg`Failed to extract tarball.`;
    case ApplicationExceptionCode.UPGRADE_FAILED:
      return msg`Application upgrade failed.`;
    case ApplicationExceptionCode.APP_ALREADY_INSTALLED:
      return msg`This version of the application is already installed in this workspace.`;
    case ApplicationExceptionCode.CANNOT_DOWNGRADE_APPLICATION:
      return msg`A higher version of this application is already installed. Downgrading is not allowed.`;
    default:
      assertUnreachable(code);
  }
};

export class ApplicationException extends CustomException<ApplicationExceptionCode> {
  constructor(
    message: string,
    code: ApplicationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getApplicationExceptionUserFriendlyMessage(code),
    });
  }
}
