import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailingDomainDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

const emailingDomainDriverExceptionUserFriendlyMessages: Record<
  EmailingDomainDriverExceptionCode,
  MessageDescriptor
> = {
  [EmailingDomainDriverExceptionCode.NOT_FOUND]: msg`Email domain not found.`,
  [EmailingDomainDriverExceptionCode.TEMPORARY_ERROR]: msg`A temporary error occurred. Please try again.`,
  [EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS]: msg`Insufficient permissions for email domain.`,
  [EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR]: msg`Email domain configuration error.`,
  [EmailingDomainDriverExceptionCode.UNKNOWN]: msg`An unknown email error occurred.`,
};

export class EmailingDomainDriverException extends CustomException<EmailingDomainDriverExceptionCode> {
  constructor(
    message: string,
    code: EmailingDomainDriverExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        emailingDomainDriverExceptionUserFriendlyMessages[code],
    });
  }
}
