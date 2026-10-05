import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum ApplicationVariableEntityExceptionCode {
  APPLICATION_VARIABLE_NOT_FOUND = 'APPLICATION_VARIABLE_NOT_FOUND',
  INVALID_APPLICATION_VARIABLE_INPUT = 'INVALID_APPLICATION_VARIABLE_INPUT',
}

const getApplicationVariableEntityExceptionUserFriendlyMessage = (
  code: ApplicationVariableEntityExceptionCode,
) => {
  switch (code) {
    case ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND:
      return msg`Application variable not found.`;
    case ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT:
      return msg`Invalid application variable input.`;
    default:
      assertUnreachable(code);
  }
};
const APPLICATION_VARIABLE_ENTITY_EXCEPTION_CATEGORY_BY_CODE = {
  [ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND]:
    'NOT_FOUND',
  [ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT]:
    'BAD_USER_INPUT',
} as const satisfies Record<
  ApplicationVariableEntityExceptionCode,
  ExceptionCategory
>;

export class ApplicationVariableEntityException extends CustomException<ApplicationVariableEntityExceptionCode> {
  constructor(
    message: string,
    code: ApplicationVariableEntityExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getApplicationVariableEntityExceptionUserFriendlyMessage(code),
      category: APPLICATION_VARIABLE_ENTITY_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
