import { Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CallWebhookBatchJobData,
  CallWebhookJob,
  type CallWebhookJobData,
} from 'src/engine/core-modules/webhook/jobs/call-webhook.job';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { transformEventBatchToWebhookBatch } from 'src/engine/core-modules/webhook/utils/transform-webhook-event-batch-to-webhook-data';

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly webhookService: WebhookService,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const webhooks = await this.webhookService.findByOperations(
      workspaceEventBatch.workspaceId,
      [
        `${nameSingular}.${operation}`,
        `*.${operation}`,
        `${nameSingular}.*`,
        '*.*',
      ],
    );

    for (const webhook of webhooks) {
      const webhookEventBatch = transformEventBatchToWebhookBatch({
        workspaceEventBatch,
        webhook,
      });

      await this.messageQueueService.add<CallWebhookBatchJobData>(
        CallWebhookJob.name,
        webhookEventBatch,
        { retryLimit: 3 },
      );

      // DEPRECATED: REMOVE THE LINES BELOW AFTER 12/11/2025
      const {
        items,
        batchSize: _,
        ...webhookEventBatchWithoutItems
      } = webhookEventBatch;

      for (const item of items) {
        const webhookData: CallWebhookJobData = {
          ...webhookEventBatchWithoutItems,
          ...item,
        };

        await this.messageQueueService.add<CallWebhookJobData>(
          CallWebhookJob.name,
          webhookData,
          { retryLimit: 3 },
        );
      }
      // END DEPRECATED
    }
  }
}
