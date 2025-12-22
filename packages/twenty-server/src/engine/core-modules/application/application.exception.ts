import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationExceptionCode {
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
}

const applicationExceptionUserFriendlyMessages: Record<
  ApplicationExceptionCode,
  MessageDescriptor
> = {
  [ApplicationExceptionCode.OBJECT_NOT_FOUND]: msg`Object not found.`,
  [ApplicationExceptionCode.FIELD_NOT_FOUND]: msg`Field not found.`,
  [ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND]: msg`Serverless function not found.`,
  [ApplicationExceptionCode.ENTITY_NOT_FOUND]: msg`Entity not found.`,
  [ApplicationExceptionCode.APPLICATION_NOT_FOUND]: msg`Application not found.`,
  [ApplicationExceptionCode.FORBIDDEN]: msg`You do not have permission to perform this action.`,
};

export class ApplicationException extends CustomException<ApplicationExceptionCode> {
  constructor(
    message: string,
    code: ApplicationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? applicationExceptionUserFriendlyMessages[code],
    });
  }
}
