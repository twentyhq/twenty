import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationExceptionCode {
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_INPUT = 'INVALID_INPUT',
  // Tarball installation errors
  INVALID_URL = 'INVALID_URL',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  TARBALL_TOO_LARGE = 'TARBALL_TOO_LARGE',
  INVALID_TARBALL_STRUCTURE = 'INVALID_TARBALL_STRUCTURE',
  INVALID_MANIFEST = 'INVALID_MANIFEST',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

const getApplicationExceptionUserFriendlyMessage = (
  code: ApplicationExceptionCode,
) => {
  switch (code) {
    case ApplicationExceptionCode.OBJECT_NOT_FOUND:
      return msg`Object not found.`;
    case ApplicationExceptionCode.FIELD_NOT_FOUND:
      return msg`Field not found.`;
    case ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      return msg`Serverless function not found.`;
    case ApplicationExceptionCode.ENTITY_NOT_FOUND:
      return msg`Entity not found.`;
    case ApplicationExceptionCode.APPLICATION_NOT_FOUND:
      return msg`Application not found.`;
    case ApplicationExceptionCode.FORBIDDEN:
      return msg`You do not have permission to perform this action.`;
    case ApplicationExceptionCode.INVALID_INPUT:
      return msg`Invalid input provided.`;
    case ApplicationExceptionCode.INVALID_URL:
      return msg`Invalid URL provided.`;
    case ApplicationExceptionCode.DOWNLOAD_FAILED:
      return msg`Failed to download the application tarball.`;
    case ApplicationExceptionCode.TARBALL_TOO_LARGE:
      return msg`Application tarball exceeds the maximum allowed size.`;
    case ApplicationExceptionCode.INVALID_TARBALL_STRUCTURE:
      return msg`Invalid tarball structure.`;
    case ApplicationExceptionCode.INVALID_MANIFEST:
      return msg`Invalid application manifest.`;
    case ApplicationExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
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
