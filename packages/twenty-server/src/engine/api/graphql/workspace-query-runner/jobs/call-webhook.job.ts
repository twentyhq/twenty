import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type CallWebhookJobData = {
  targetUrl: string;
  eventName: string;
  objectMetadata: { id: string; nameSingular: string };
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  record: any;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  private readonly logger = new Logger(CallWebhookJob.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Process(CallWebhookJob.name)
  async handle(data: CallWebhookJobData): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.post(
        data.targetUrl,
        data,
      );
      const eventInput = {
        action: 'webhook.response',
        payload: {
          status: response.status,
          url: data.targetUrl,
          webhookId: data.webhookId,
          eventName: data.eventName,
        },
      };

      this.analyticsService.create(eventInput, 'webhook', data.workspaceId);
    } catch (err) {
      const eventInput = {
        action: 'webhook.response',
        payload: {
          status: err.response.status,
          url: data.targetUrl,
          webhookId: data.webhookId,
          eventName: data.eventName,
        },
      };

      this.analyticsService.create(eventInput, 'webhook', data.workspaceId);
      this.logger.error(
        `Error calling webhook on targetUrl '${data.targetUrl}': ${err}`,
      );
    }
  }
}
