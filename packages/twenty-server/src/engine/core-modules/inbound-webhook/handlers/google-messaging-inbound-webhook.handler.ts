import { Injectable, Logger } from '@nestjs/common';

import { InboundWebhookSubscriptionService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-subscription.service';
import { type InboundWebhookSubscriptionEntity } from 'src/engine/core-modules/inbound-webhook/entities/inbound-webhook-subscription.entity';
import {
  type InboundWebhookEnvelope,
  type InboundWebhookRequest,
} from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-context.type';
import { type SubscribableInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-handler.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

type PubSubPushBody = {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
};

type GmailHistoryNotification = {
  emailAddress?: string;
  historyId?: number | string;
};

@Injectable()
export class GoogleMessagingInboundWebhookHandler
  implements SubscribableInboundWebhookHandler
{
  private readonly logger = new Logger(GoogleMessagingInboundWebhookHandler.name);

  constructor(
    private readonly subscriptionService: InboundWebhookSubscriptionService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messagingQueue: MessageQueueService,
  ) {}

  // Google Pub/Sub push delivers a JWT in the Authorization header signed by
  // Google. Production verification fetches Google's public keys + checks
  // audience. Out of scope for this PR — wired in when the driver migration
  // PR enables push for live workspaces.
  async verify(_request: InboundWebhookRequest): Promise<boolean> {
    return true;
  }

  async buildEnvelope(
    request: InboundWebhookRequest,
  ): Promise<InboundWebhookEnvelope> {
    const body = (request.body ?? {}) as PubSubPushBody;
    const messageId = body.message?.messageId ?? '';
    const decoded = this.decodePubSubData(body.message?.data);
    const subscription = decoded.emailAddress
      ? await this.findSubscriptionByEmail(decoded.emailAddress)
      : null;

    return {
      source: 'google-messaging',
      externalEventId: messageId,
      workspaceId: subscription?.workspaceId ?? null,
      subscriptionId: subscription?.id ?? null,
      payload: { decoded, raw: body },
      headers: request.headers as Record<string, string | string[] | undefined>,
    };
  }

  async handle(envelope: InboundWebhookEnvelope): Promise<void> {
    if (envelope.subscriptionId === null) {
      this.logger.warn(
        'Received Google messaging push for unknown subscription — dropping',
      );

      return;
    }

    const subscription = await this.subscriptionService.findById(
      envelope.subscriptionId,
    );

    if (
      subscription === null ||
      subscription.connectedAccountId === null ||
      subscription.workspaceId === null
    ) {
      return;
    }

    await this.subscriptionService.markNotified(subscription.id);

    const messageChannelId = this.resolveMessageChannelId(subscription);

    if (messageChannelId === null) {
      return;
    }

    const jobData: MessagingMessageListFetchJobData = {
      messageChannelId,
      workspaceId: subscription.workspaceId,
    };

    await this.messagingQueue.add<MessagingMessageListFetchJobData>(
      MessagingMessageListFetchJob.name,
      jobData,
    );
  }

  // Gmail watch expires after 7 days and must be re-issued. Concrete Gmail
  // API call lives in the driver layer — added in the driver migration PR.
  async renewSubscription(
    _subscription: InboundWebhookSubscriptionEntity,
  ): Promise<void> {
    this.logger.log(
      'Google messaging subscription renewal hook — implementation pending driver migration',
    );
  }

  private decodePubSubData(data?: string): GmailHistoryNotification {
    if (data === undefined) {
      return {};
    }

    try {
      const parsed: unknown = JSON.parse(
        Buffer.from(data, 'base64').toString('utf-8'),
      );

      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as GmailHistoryNotification;
      }

      return {};
    } catch {
      return {};
    }
  }

  private async findSubscriptionByEmail(
    _emailAddress: string,
  ): Promise<InboundWebhookSubscriptionEntity | null> {
    // Lookup by metadata.emailAddress — populated when the driver migration
    // PR creates the subscription during message-channel onboarding.
    return null;
  }

  private resolveMessageChannelId(
    subscription: InboundWebhookSubscriptionEntity,
  ): string | null {
    const messageChannelId = subscription.metadata?.['messageChannelId'];

    return typeof messageChannelId === 'string' ? messageChannelId : null;
  }
}
