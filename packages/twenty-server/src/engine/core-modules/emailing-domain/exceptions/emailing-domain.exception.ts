import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum EmailingDomainExceptionCode {
  EMAILING_DOMAIN_ALREADY_REGISTERED = 'EMAILING_DOMAIN_ALREADY_REGISTERED',
  EMAILING_DOMAIN_NOT_VERIFIED = 'EMAILING_DOMAIN_NOT_VERIFIED',
  EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY = 'EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY',
  MESSAGE_SUPPRESSION_NOT_FOUND = 'MESSAGE_SUPPRESSION_NOT_FOUND',
  MESSAGE_SUPPRESSION_NOT_REMOVABLE = 'MESSAGE_SUPPRESSION_NOT_REMOVABLE',
  MESSAGE_CAMPAIGN_NOT_FOUND = 'MESSAGE_CAMPAIGN_NOT_FOUND',
  MESSAGE_CAMPAIGN_NOT_SENDABLE = 'MESSAGE_CAMPAIGN_NOT_SENDABLE',
  MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS = 'MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS',
  MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE = 'MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE',
  MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED = 'MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED',
  MESSAGE_CAMPAIGN_REQUIRES_PAID_PLAN = 'MESSAGE_CAMPAIGN_REQUIRES_PAID_PLAN',
  MESSAGE_CAMPAIGN_NOT_CANCELABLE = 'MESSAGE_CAMPAIGN_NOT_CANCELABLE',
  MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE = 'MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE',
}

const getEmailingDomainExceptionUserFriendlyMessage = (
  code: EmailingDomainExceptionCode,
) => {
  switch (code) {
    case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
      return msg`Registered by another workspace.`;
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
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE:
      return msg`This campaign cannot be sent while the workspace subscription is inactive.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED:
      return msg`This campaign is stopped by an email usage limit set on this workspace. Raise the limit or send to a smaller list.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_REQUIRES_PAID_PLAN:
      return msg`Sending campaigns is available once your workspace is on a paid plan and has been billed.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE:
      return msg`This campaign cannot be sent. It may be missing a sender, subject or recipient list, or it was already sent.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_CANCELABLE:
      return msg`Only a scheduled or sending campaign can be canceled.`;
    case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE:
      return msg`Pick a send time in the future.`;
    default:
      assertUnreachable(code);
  }
};
const EMAILING_DOMAIN_EXCEPTION_CATEGORY_BY_CODE = {
  [EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED]: 'CONFLICT',
  [EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED]: 'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND]: 'NOT_FOUND',
  [EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE]: 'FORBIDDEN',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND]: 'NOT_FOUND',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE]: 'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_REQUIRES_PAID_PLAN]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_CANCELABLE]:
    'BAD_USER_INPUT',
  [EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE]:
    'BAD_USER_INPUT',
} as const satisfies Record<EmailingDomainExceptionCode, ExceptionCategory>;

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
      category: EMAILING_DOMAIN_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
