import { Command, CommandRunner } from 'nest-commander';

import {
  CLEANUP_ORPHANED_FILES_CRON_PATTERN,
  CleanupOrphanedFilesCronJob,
} from 'src/engine/core-modules/file/crons/jobs/cleanup-orphaned-files.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:file:cleanup-orphaned-files',
  description: 'Starts a cron job to clean up orphaned files (no messageId)',
})
export class CleanupOrphanedFilesCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CleanupOrphanedFilesCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CLEANUP_ORPHANED_FILES_CRON_PATTERN },
      },
    });
  }
}
