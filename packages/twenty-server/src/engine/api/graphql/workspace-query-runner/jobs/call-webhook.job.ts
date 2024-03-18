import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

export type CallWebhookJobData = {
  targetUrl: string;
  eventType: string;
  objectMetadata: { id: string; nameSingular: string };
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  record: any;
};

@Injectable()
export class CallWebhookJob implements MessageQueueJob<CallWebhookJobData> {
  private readonly logger = new Logger(CallWebhookJob.name);

  constructor(private readonly httpService: HttpService) {}

  async handle(data: CallWebhookJobData): Promise<void> {
    try {
      await this.httpService.axiosRef.post(data.targetUrl, data);
      this.logger.log(
        `CallWebhookJob successfully called on targetUrl '${data.targetUrl}'`,
      );
    } catch (err) {
      this.logger.error(
        `Error calling webhook on targetUrl '${data.targetUrl}': ${err}`,
      );
    }
  }
}
