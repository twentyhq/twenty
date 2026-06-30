import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum EmailingDomainDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  SENDING_SUSPENDED = 'SENDING_SUSPENDED',
  ALL_RECIPIENTS_SUPPRESSED = 'ALL_RECIPIENTS_SUPPRESSED',
  UNSUBSCRIBE_NOT_READY = 'UNSUBSCRIBE_NOT_READY',
  UNKNOWN = 'UNKNOWN',
}

const getEmailingDomainDriverExceptionUserFriendlyMessage = (
  code: EmailingDomainDriverExceptionCode,
) => {
  switch (code) {
    case EmailingDomainDriverExceptionCode.NOT_FOUND:
      return msg`Email domain not found.`;
    case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      return msg`Insufficient permissions for email domain.`;
    case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
      return msg`Email domain configuration error.`;
    case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
      return msg`Sending is currently suspended for this email domain.`;
    case EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED:
      return msg`All recipients are suppressed for this email domain.`;
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
      return msg`Marketing sending is on hold until the unsubscribe domain is verified.`;
    case EmailingDomainDriverExceptionCode.TEMPORARY_ERROR:
    case EmailingDomainDriverExceptionCode.UNKNOWN:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
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
        getEmailingDomainDriverExceptionUserFriendlyMessage(code),
    });
  }
}
