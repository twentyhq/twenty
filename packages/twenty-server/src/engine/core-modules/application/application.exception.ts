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
  FORBIDDEN = 'FORBIDDEN',
  INVALID_INPUT = 'INVALID_INPUT',
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
    case ApplicationExceptionCode.FORBIDDEN:
      return msg`You do not have permission to perform this action.`;
    case ApplicationExceptionCode.INVALID_INPUT:
      return msg`Invalid input provided.`;
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
