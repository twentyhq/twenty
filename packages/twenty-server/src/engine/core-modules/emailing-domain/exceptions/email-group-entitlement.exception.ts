/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const EmailGroupEntitlementExceptionCode = appendCommonExceptionCode({
  EMAIL_GROUP_ENTITLEMENT_REQUIRED: 'EMAIL_GROUP_ENTITLEMENT_REQUIRED',
} as const);

const emailGroupEntitlementExceptionUserFriendlyMessages: Record<
  keyof typeof EmailGroupEntitlementExceptionCode,
  MessageDescriptor
> = {
  EMAIL_GROUP_ENTITLEMENT_REQUIRED: msg`Email group requires an Enterprise subscription.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class EmailGroupEntitlementException extends CustomException<
  keyof typeof EmailGroupEntitlementExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof EmailGroupEntitlementExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        emailGroupEntitlementExceptionUserFriendlyMessages[code],
    });
  }
}
