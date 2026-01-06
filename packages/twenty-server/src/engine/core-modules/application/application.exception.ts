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
