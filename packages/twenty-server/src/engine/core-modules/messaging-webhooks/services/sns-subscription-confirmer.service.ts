import { Injectable, Logger } from '@nestjs/common';

import { MessagingWebhookExceptionCode } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook.exception';

const SNS_SUBSCRIBE_URL_PATTERN =
  /^https:\/\/sns\.[a-z0-9-]+\.amazonaws\.com\//;

@Injectable()
export class SnsSubscriptionConfirmerService {
  private readonly logger = new Logger(SnsSubscriptionConfirmerService.name);

  async confirm(subscribeUrl: string | undefined): Promise<void> {
    if (!subscribeUrl) {
      throw new MessagingWebhookException(
        'Missing SubscribeURL on SNS subscription confirmation',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    if (!SNS_SUBSCRIBE_URL_PATTERN.test(subscribeUrl)) {
      throw new MessagingWebhookException(
        `Refusing to fetch non-AWS SubscribeURL: ${subscribeUrl}`,
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SUBSCRIBE_URL,
      );
    }

    const response = await fetch(subscribeUrl);

    if (!response.ok) {
      throw new MessagingWebhookException(
        `Failed to confirm SNS subscription via ${subscribeUrl}: ${response.status}`,
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_SUBSCRIPTION_CONFIRMATION_FAILED,
      );
    }

    this.logger.log(`Confirmed SNS subscription via ${subscribeUrl}`);
  }
}
