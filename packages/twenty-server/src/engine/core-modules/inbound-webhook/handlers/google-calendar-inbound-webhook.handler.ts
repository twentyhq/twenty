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

@Injectable()
export class GoogleCalendarInboundWebhookHandler
  implements SubscribableInboundWebhookHandler
{
  private readonly logger = new Logger(GoogleCalendarInboundWebhookHandler.name);

  constructor(
    private readonly subscriptionService: InboundWebhookSubscriptionService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueue: MessageQueueService,
  ) {}

  // Google Calendar push uses the X-Goog-Channel-Token header as a shared
  // secret declared at watch-creation time. Compare against the subscription
  // secret looked up by X-Goog-Channel-ID.
  async verify(request: InboundWebhookRequest): Promise<boolean> {
    const channelId = this.headerValue(request, 'x-goog-channel-id');
    const channelToken = this.headerValue(request, 'x-goog-channel-token');

    if (channelId === null || channelToken === null) {
      return false;
    }

    const subscription =
      await this.subscriptionService.findByExternalSubscriptionId({
        source: 'google-calendar',
        externalSubscriptionId: channelId,
      });

    return subscription !== null && subscription.secret === channelToken;
  }

  async buildEnvelope(
    request: InboundWebhookRequest,
  ): Promise<InboundWebhookEnvelope> {
    const channelId = this.headerValue(request, 'x-goog-channel-id') ?? '';
    const messageNumber =
      this.headerValue(request, 'x-goog-message-number') ?? '';
    const subscription =
      await this.subscriptionService.findByExternalSubscriptionId({
        source: 'google-calendar',
        externalSubscriptionId: channelId,
      });

    return {
      source: 'google-calendar',
      externalEventId: `${channelId}:${messageNumber}`,
      workspaceId: subscription?.workspaceId ?? null,
      subscriptionId: subscription?.id ?? null,
      payload: {
        channelId,
        messageNumber,
        resourceState: this.headerValue(request, 'x-goog-resource-state'),
      },
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
      'Google calendar subscription renewal hook — implementation pending driver migration',
    );
  }

  private headerValue(
    request: InboundWebhookRequest,
    name: string,
  ): string | null {
    const value = request.headers[name];

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }

    return null;
  }

  private resolveCalendarChannelId(
    subscription: InboundWebhookSubscriptionEntity,
  ): string | null {
    const calendarChannelId = subscription.metadata?.['calendarChannelId'];

    return typeof calendarChannelId === 'string' ? calendarChannelId : null;
  }
}
