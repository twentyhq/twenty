import { Injectable, Logger } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type SesInboundNotification } from 'src/engine/core-modules/messaging-webhooks/types/sns-message.type';
import {
  MessagingInboundEmailImportJob,
  type MessagingInboundEmailImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class MessagingWebhookDispatcherService {
  private readonly logger = new Logger(MessagingWebhookDispatcherService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async confirmSnsSubscription(subscribeUrl: string | undefined): Promise<void> {
    if (!subscribeUrl) {
      return;
    }

    const response = await fetch(subscribeUrl);

    if (!response.ok) {
      this.logger.error(
        `Failed to confirm SNS subscription via ${subscribeUrl}: ${response.status}`,
      );

      return;
    }

    this.logger.log(`Confirmed SNS subscription via ${subscribeUrl}`);
  }

  async dispatchSnsNotification(payload: SnsPayload): Promise<void> {
    const notification = this.parseSesInboundNotification(payload.Message);

    if (!notification) {
      this.logger.warn(
        `SNS message ${payload.MessageId} has invalid JSON body`,
      );

      return;
    }

    const { receipt } = notification;

    if (receipt.action.type !== 'S3') {
      this.logger.warn(
        `SNS message ${payload.MessageId} has unsupported action type ${receipt.action.type}`,
      );

      return;
    }

    await this.messageQueueService.add<MessagingInboundEmailImportJobData>(
      MessagingInboundEmailImportJob.name,
      {
        s3Key: receipt.action.objectKey,
        envelopeRecipients: receipt.recipients,
      },
    );
  }

  private parseSesInboundNotification(
    rawJson: string,
  ): SesInboundNotification | null {
    try {
      return JSON.parse(rawJson) as SesInboundNotification;
    } catch {
      return null;
    }
  }
}
