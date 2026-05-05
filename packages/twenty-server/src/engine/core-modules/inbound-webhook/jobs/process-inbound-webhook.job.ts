import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { InboundWebhookDispatcherService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-dispatcher.service';
import { type InboundWebhookJobData } from 'src/engine/core-modules/inbound-webhook/dtos/inbound-webhook-job-data.type';

@Processor(MessageQueue.inboundWebhookQueue)
export class ProcessInboundWebhookJob {
  private readonly logger = new Logger(ProcessInboundWebhookJob.name);

  constructor(private readonly dispatcher: InboundWebhookDispatcherService) {}

  @Process(ProcessInboundWebhookJob.name)
  async handle(data: InboundWebhookJobData): Promise<void> {
    const { envelope } = data;
    const handler = this.dispatcher.resolve(envelope.source);

    try {
      await handler.handle(envelope);
    } catch (error) {
      this.logger.error(
        `Failed to process inbound webhook ${envelope.source}:${envelope.externalEventId}`,
        error instanceof Error ? error.stack : error,
      );

      throw error;
    }
  }
}
