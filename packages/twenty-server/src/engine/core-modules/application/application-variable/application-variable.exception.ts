import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationVariableEntityExceptionCode {
  APPLICATION_VARIABLE_NOT_FOUND = 'APPLICATION_VARIABLE_NOT_FOUND',
}

const getApplicationVariableEntityExceptionUserFriendlyMessage = (
  code: ApplicationVariableEntityExceptionCode,
) => {
  switch (code) {
    case ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND:
      return msg`Application variable not found.`;
    default:
      assertUnreachable(code);
  }
};

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
    });
  }
}
