import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailingDomainExceptionCode {
  EMAILING_DOMAIN_ALREADY_REGISTERED = 'EMAILING_DOMAIN_ALREADY_REGISTERED',
  MESSAGE_SUPPRESSION_NOT_FOUND = 'MESSAGE_SUPPRESSION_NOT_FOUND',
  MESSAGE_SUPPRESSION_NOT_REMOVABLE = 'MESSAGE_SUPPRESSION_NOT_REMOVABLE',
}

const getEmailingDomainExceptionUserFriendlyMessage = (
  code: EmailingDomainExceptionCode,
) => {
  switch (code) {
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
      return msg`This domain is already registered.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND:
      return msg`This suppressed address no longer exists.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE:
      return msg`This address cannot be removed from the suppression list.`;
    default:
      assertUnreachable(code);
  }
};

export class EmailingDomainException extends CustomException<EmailingDomainExceptionCode> {
  constructor(
    message: string,
    code: EmailingDomainExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getEmailingDomainExceptionUserFriendlyMessage(code),
    });
  }
}
