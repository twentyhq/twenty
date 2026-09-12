import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailingDomainExceptionCode {
  EMAILING_DOMAIN_ALREADY_REGISTERED = 'EMAILING_DOMAIN_ALREADY_REGISTERED',
  EMAILING_DOMAIN_NOT_VERIFIED = 'EMAILING_DOMAIN_NOT_VERIFIED',
  EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY = 'EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY',
  MESSAGE_SUPPRESSION_NOT_FOUND = 'MESSAGE_SUPPRESSION_NOT_FOUND',
  MESSAGE_SUPPRESSION_NOT_REMOVABLE = 'MESSAGE_SUPPRESSION_NOT_REMOVABLE',
  MESSAGE_CAMPAIGN_NOT_FOUND = 'MESSAGE_CAMPAIGN_NOT_FOUND',
  MESSAGE_CAMPAIGN_NOT_SENDABLE = 'MESSAGE_CAMPAIGN_NOT_SENDABLE',
  MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS = 'MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS',
  MESSAGE_CAMPAIGN_NOT_CANCELABLE = 'MESSAGE_CAMPAIGN_NOT_CANCELABLE',
}

const getEmailingDomainExceptionUserFriendlyMessage = (
  code: EmailingDomainExceptionCode,
) => {
  switch (code) {
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
      return msg`This domain is already registered.`;
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED:
      return msg`No verified sending domain matches this from address.`;
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY:
      return msg`Marketing sending is on hold until the unsubscribe domain is verified.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND:
      return msg`This suppressed address no longer exists.`;
    case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE:
      return msg`This address cannot be removed from the suppression list.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND:
      return msg`This campaign no longer exists.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS:
      return msg`This campaign needs more email credits than your workspace has left. Top up your credits or send to a smaller list.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE:
      return msg`This campaign cannot be sent. It may be missing a sender, subject or recipient list, or it was already sent.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_CANCELABLE:
      return msg`Only a campaign that is currently sending can be canceled.`;
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
