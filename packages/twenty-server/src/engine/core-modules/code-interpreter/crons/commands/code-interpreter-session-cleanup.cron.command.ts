import { Command, CommandRunner } from 'nest-commander';

import { CODE_INTERPRETER_SESSION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/code-interpreter/constants/code-interpreter-session-cleanup-cron-pattern.constant';
import { CodeInterpreterSessionCleanupCronJob } from 'src/engine/core-modules/code-interpreter/crons/jobs/code-interpreter-session-cleanup.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:code-interpreter:session-cleanup',
  description:
    'Starts a cron job to reclaim expired (abandoned) code interpreter sandboxes',
})
export class CodeInterpreterSessionCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CodeInterpreterSessionCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CODE_INTERPRETER_SESSION_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
