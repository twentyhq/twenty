import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/workspace/workspace-query-runner/interfaces/query-runner-optionts.interface';

import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';

@Injectable()
export class WebhooksService {
  constructor(
    @Inject(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async triggerWebhooks<Record>(
    jobsData: Record[] | undefined,
    operation: CallWebhookJobsJobOperation,
    options: WorkspaceQueryRunnerOptions,
  ) {
    if (!Array.isArray(jobsData)) {
      return;
    }
    jobsData.forEach((jobData) => {
      this.messageQueueService.add<CallWebhookJobsJobData>(
        CallWebhookJobsJob.name,
        {
          record: jobData,
          workspaceId: options.workspaceId,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }
}
