import { assertUnreachable } from 'twenty-shared/utils';

import { MessagingWebhookExceptionCode } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { type MessagingWebhookException } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook.exception';

export const getMessagingWebhookExceptionStatusCode = (
  exception: MessagingWebhookException,
): 400 | 403 | 500 => {
  switch (exception.code) {
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SUBSCRIBE_URL:
      return 400;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_FORBIDDEN_TOPIC:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE:
      return 403;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_SUBSCRIPTION_CONFIRMATION_FAILED:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR:
      return 500;
    default: {
      return assertUnreachable(exception.code);
    }
  }
};
