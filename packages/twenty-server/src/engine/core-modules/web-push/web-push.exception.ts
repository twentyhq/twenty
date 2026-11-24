import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebPushExceptionCode {
  ENDPOINT_NOT_ALLOWED = 'ENDPOINT_NOT_ALLOWED',
  UNKNOWN_VAPID_PUBLIC_KEY = 'UNKNOWN_VAPID_PUBLIC_KEY',
  ACTIVE_SESSION_NOT_FOUND = 'ACTIVE_SESSION_NOT_FOUND',
}

const getWebPushExceptionUserFriendlyMessage = (code: WebPushExceptionCode) => {
  switch (code) {
    case WebPushExceptionCode.ENDPOINT_NOT_ALLOWED:
      return msg`This browser's push service is not supported.`;
    case WebPushExceptionCode.UNKNOWN_VAPID_PUBLIC_KEY:
      return msg`Browser notifications were set up with an outdated key. Reload the page to set them up again.`;
    case WebPushExceptionCode.ACTIVE_SESSION_NOT_FOUND:
      return msg`Your session has expired. Sign in again to turn on browser notifications.`;
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
