import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationVariableEntityExceptionCode {
  APPLICATION_VARIABLE_NOT_FOUND = 'APPLICATION_VARIABLE_NOT_FOUND',
}

const applicationVariableEntityExceptionUserFriendlyMessages: Record<
  ApplicationVariableEntityExceptionCode,
  MessageDescriptor
> = {
  [ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND]: msg`Application variable not found.`,
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
        applicationVariableEntityExceptionUserFriendlyMessages[code],
    });
  }
}
