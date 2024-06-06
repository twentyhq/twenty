import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export type CallWebhookJobData = {
  targetUrl: string;
  eventType: string;
  objectMetadata: { id: string; nameSingular: string };
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  record: any;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  private readonly logger = new Logger(CallWebhookJob.name);

  constructor(private readonly httpService: HttpService) {}

  @Process(CallWebhookJob.name)
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
