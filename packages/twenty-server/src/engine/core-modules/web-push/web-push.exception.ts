import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebPushExceptionCode {
  PUSH_SUBSCRIPTION_ENDPOINT_NOT_ALLOWED = 'PUSH_SUBSCRIPTION_ENDPOINT_NOT_ALLOWED',
  PUSH_SUBSCRIPTION_KEY_UNKNOWN = 'PUSH_SUBSCRIPTION_KEY_UNKNOWN',
  PUSH_SUBSCRIPTION_ORIGIN_MISSING = 'PUSH_SUBSCRIPTION_ORIGIN_MISSING',
  PUSH_SUBSCRIPTION_SESSION_NOT_FOUND = 'PUSH_SUBSCRIPTION_SESSION_NOT_FOUND',
  PUSH_SUBSCRIPTION_LIMIT_REACHED = 'PUSH_SUBSCRIPTION_LIMIT_REACHED',
}

const getWebPushExceptionUserFriendlyMessage = (code: WebPushExceptionCode) => {
  switch (code) {
    case WebPushExceptionCode.PUSH_SUBSCRIPTION_ENDPOINT_NOT_ALLOWED:
      return msg`This browser's notification service is not supported.`;
    case WebPushExceptionCode.PUSH_SUBSCRIPTION_KEY_UNKNOWN:
      return msg`This browser subscribed to notifications with an outdated key. Reload the page to try again.`;
    case WebPushExceptionCode.PUSH_SUBSCRIPTION_ORIGIN_MISSING:
    case WebPushExceptionCode.PUSH_SUBSCRIPTION_SESSION_NOT_FOUND:
      return msg`Notifications can only be turned on from a signed-in browser.`;
    case WebPushExceptionCode.PUSH_SUBSCRIPTION_LIMIT_REACHED:
      return msg`Too many browsers receive notifications for this account.`;
    default:
      assertUnreachable(code);
  }
};

export class WebPushException extends CustomException<WebPushExceptionCode> {
  constructor(
    message: string,
    code: WebPushExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWebPushExceptionUserFriendlyMessage(code),
    });
  }
}
