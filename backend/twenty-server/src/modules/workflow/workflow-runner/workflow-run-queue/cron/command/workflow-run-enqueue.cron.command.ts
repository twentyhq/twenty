import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  WorkflowRunEnqueueCronJob,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/jobs/workflow-run-enqueue.cron.job';

@Command({
  name: 'cron:workflow:enqueue-awaiting-workflow-run',
  description: 'Enqueues awaiting workflow runs',
})
export class WorkflowRunEnqueueCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: WorkflowRunEnqueueCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
        },
      },
    });
  }
}
