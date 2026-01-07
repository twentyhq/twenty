import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookExceptionCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  INVALID_TARGET_URL = 'INVALID_TARGET_URL',
}

const getWebhookExceptionUserFriendlyMessage = (code: WebhookExceptionCode) => {
  switch (code) {
    case WebhookExceptionCode.WEBHOOK_NOT_FOUND:
      return msg`Webhook not found.`;
    case WebhookExceptionCode.INVALID_TARGET_URL:
      return msg`Invalid target URL.`;
    default:
      assertUnreachable(code);
  }
};

export class WebhookException extends CustomException<WebhookExceptionCode> {
  constructor(
    message: string,
    code: WebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWebhookExceptionUserFriendlyMessage(code),
    });
  }
}
