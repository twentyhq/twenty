import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { MessagingWebhookExceptionCode } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { CustomException } from 'src/utils/custom-exception';

const getMessagingWebhookExceptionUserFriendlyMessage = (
  code: MessagingWebhookExceptionCode,
) => {
  switch (code) {
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SUBSCRIBE_URL:
      return msg`The webhook request could not be processed.`;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_FORBIDDEN_TOPIC:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE:
      return msg`The webhook request could not be authenticated.`;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_SUBSCRIPTION_CONFIRMATION_FAILED:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR:
      return msg`An error occurred while processing the webhook.`;
    default:
      assertUnreachable(code);
  }
};

export class MessagingWebhookException extends CustomException<MessagingWebhookExceptionCode> {
  constructor(
    message: string,
    code: MessagingWebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMessagingWebhookExceptionUserFriendlyMessage(code),
    });
  }
}
