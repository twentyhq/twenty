import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailingDomainExceptionCode {
  EMAILING_DOMAIN_ALREADY_REGISTERED = 'EMAILING_DOMAIN_ALREADY_REGISTERED',
  EMAILING_DOMAIN_NOT_VERIFIED = 'EMAILING_DOMAIN_NOT_VERIFIED',
  MESSAGE_SUPPRESSION_NOT_FOUND = 'MESSAGE_SUPPRESSION_NOT_FOUND',
  MESSAGE_SUPPRESSION_NOT_REMOVABLE = 'MESSAGE_SUPPRESSION_NOT_REMOVABLE',
  MESSAGE_CAMPAIGN_NOT_FOUND = 'MESSAGE_CAMPAIGN_NOT_FOUND',
  MESSAGE_CAMPAIGN_NOT_SENDABLE = 'MESSAGE_CAMPAIGN_NOT_SENDABLE',
}

const getEmailingDomainExceptionUserFriendlyMessage = (
  code: EmailingDomainExceptionCode,
) => {
  switch (code) {
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
      return msg`This domain is already registered.`;
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED:
      return msg`No verified sending domain matches this from address.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND:
      return msg`This suppressed address no longer exists.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE:
      return msg`Only bounced addresses can be removed. People who unsubscribed or reported spam must opt back in themselves.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND:
      return msg`This campaign no longer exists.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE:
      return msg`This campaign cannot be sent. It may be missing a sender, subject or recipient list, or it was already sent.`;
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
