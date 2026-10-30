import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SETU_AI_ACTION_DISPATCHER_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-action-dispatcher-cron-pattern.constant';
import { SetuAiActionDispatcherCronJob } from 'src/engine/metadata-modules/ai/ai-actions/crons/jobs/setu-ai-action-dispatcher.cron.job';

@Command({
  name: 'cron:setu-ai-actions:dispatch',
  description:
    'Starts a cron job that enqueues approved AI actions, expires stale reviews and reconciles abandoned runs',
})
export class SetuAiActionDispatcherCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: SetuAiActionDispatcherCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: SETU_AI_ACTION_DISPATCHER_CRON_PATTERN },
      },
    });
  }
}
