import { Command, CommandRunner } from 'nest-commander';

import { PENDING_FILE_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { PendingFileCleanupCronJob } from 'src/engine/core-modules/file/file-upload/crons/jobs/pending-file-cleanup.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:pending-file-cleanup',
  description:
    'Starts a cron job to clean up stale pending direct file uploads',
})
export class PendingFileCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: PendingFileCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: PENDING_FILE_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
