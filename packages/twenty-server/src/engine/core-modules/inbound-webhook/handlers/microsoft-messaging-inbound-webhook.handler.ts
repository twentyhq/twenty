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

type GraphChangeNotification = {
  subscriptionId?: string;
  clientState?: string;
  resource?: string;
  resourceData?: { id?: string };
};

type GraphNotificationBatch = {
  value?: GraphChangeNotification[];
};

@Injectable()
export class MicrosoftMessagingInboundWebhookHandler
  implements SubscribableInboundWebhookHandler
{
  private readonly logger = new Logger(
    MicrosoftMessagingInboundWebhookHandler.name,
  );

  constructor(
    private readonly subscriptionService: InboundWebhookSubscriptionService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messagingQueue: MessageQueueService,
  ) {}

  // Microsoft Graph echoes back the clientState set when the subscription
  // was created. Looking up by subscriptionId + comparing clientState is
  // the documented verify pattern.
  async verify(request: InboundWebhookRequest): Promise<boolean> {
    const body = (request.body ?? {}) as GraphNotificationBatch;
    const notifications = body.value ?? [];

    if (notifications.length === 0) {
      return false;
    }

    for (const notification of notifications) {
      const externalSubscriptionId = notification.subscriptionId;
      const clientState = notification.clientState;

      if (
        externalSubscriptionId === undefined ||
        clientState === undefined
      ) {
        return false;
      }

      const subscription =
        await this.subscriptionService.findByExternalSubscriptionId({
          source: 'microsoft-messaging',
          externalSubscriptionId,
        });

      if (subscription === null || subscription.secret !== clientState) {
        return false;
      }
    }

    return true;
  }

  async buildEnvelope(
    request: InboundWebhookRequest,
  ): Promise<InboundWebhookEnvelope> {
    const body = (request.body ?? {}) as GraphNotificationBatch;
    const first = body.value?.[0];
    const subscription =
      first?.subscriptionId !== undefined
        ? await this.subscriptionService.findByExternalSubscriptionId({
            source: 'microsoft-messaging',
            externalSubscriptionId: first.subscriptionId,
          })
        : null;

    return {
      source: 'microsoft-messaging',
      externalEventId: this.computeEventId(body),
      workspaceId: subscription?.workspaceId ?? null,
      subscriptionId: subscription?.id ?? null,
      payload: body,
      headers: request.headers as Record<string, string | string[] | undefined>,
    };
  }

  async handle(envelope: InboundWebhookEnvelope): Promise<void> {
    if (envelope.subscriptionId === null) {
      return;
    }

    const subscription = await this.subscriptionService.findById(
      envelope.subscriptionId,
    );

    if (subscription === null) {
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

  async renewSubscription(
    _subscription: InboundWebhookSubscriptionEntity,
  ): Promise<void> {
    this.logger.log(
      'Microsoft messaging subscription renewal hook — implementation pending driver migration',
    );
  }

  private computeEventId(body: GraphNotificationBatch): string {
    const ids = (body.value ?? [])
      .map((notification) => notification.resourceData?.id)
      .filter((id): id is string => typeof id === 'string');

    return ids.length > 0 ? ids.join(':') : `graph:${Date.now()}`;
  }

  private resolveMessageChannelId(
    subscription: InboundWebhookSubscriptionEntity,
  ): string | null {
    const messageChannelId = subscription.metadata?.['messageChannelId'];

    return typeof messageChannelId === 'string' ? messageChannelId : null;
  }
}
