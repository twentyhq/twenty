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
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';

type GraphChangeNotification = {
  subscriptionId?: string;
  clientState?: string;
  resourceData?: { id?: string };
};

type GraphNotificationBatch = {
  value?: GraphChangeNotification[];
};

@Injectable()
export class MicrosoftCalendarInboundWebhookHandler
  implements SubscribableInboundWebhookHandler
{
  private readonly logger = new Logger(
    MicrosoftCalendarInboundWebhookHandler.name,
  );

  constructor(
    private readonly subscriptionService: InboundWebhookSubscriptionService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueue: MessageQueueService,
  ) {}

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
          source: 'microsoft-calendar',
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
            source: 'microsoft-calendar',
            externalSubscriptionId: first.subscriptionId,
          })
        : null;

    return {
      source: 'microsoft-calendar',
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

    const calendarChannelId = this.resolveCalendarChannelId(subscription);

    if (calendarChannelId === null) {
      return;
    }

    const jobData: CalendarEventListFetchJobData = {
      calendarChannelId,
      workspaceId: subscription.workspaceId,
    };

    await this.calendarQueue.add<CalendarEventListFetchJobData>(
      CalendarEventListFetchJob.name,
      jobData,
    );
  }

  async renewSubscription(
    _subscription: InboundWebhookSubscriptionEntity,
  ): Promise<void> {
    this.logger.log(
      'Microsoft calendar subscription renewal hook — implementation pending driver migration',
    );
  }

  private computeEventId(body: GraphNotificationBatch): string {
    const ids = (body.value ?? [])
      .map((notification) => notification.resourceData?.id)
      .filter((id): id is string => typeof id === 'string');

    return ids.length > 0 ? ids.join(':') : `graph:${Date.now()}`;
  }

  private resolveCalendarChannelId(
    subscription: InboundWebhookSubscriptionEntity,
  ): string | null {
    const calendarChannelId = subscription.metadata?.['calendarChannelId'];

    return typeof calendarChannelId === 'string' ? calendarChannelId : null;
  }
}
