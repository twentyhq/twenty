import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookExceptionCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  INVALID_TARGET_URL = 'INVALID_TARGET_URL',
}

const webhookExceptionUserFriendlyMessages: Record<
  WebhookExceptionCode,
  MessageDescriptor
> = {
  [WebhookExceptionCode.WEBHOOK_NOT_FOUND]: msg`Webhook not found.`,
  [WebhookExceptionCode.INVALID_TARGET_URL]: msg`Invalid target URL.`,
};

export class WebhookException extends CustomException<WebhookExceptionCode> {
  constructor(
    message: string,
    code: WebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? webhookExceptionUserFriendlyMessages[code],
    });
  }
}
