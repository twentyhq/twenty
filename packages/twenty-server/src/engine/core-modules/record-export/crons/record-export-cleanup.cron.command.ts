import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECORD_EXPORT_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportCleanupCronJob } from 'src/engine/core-modules/record-export/crons/record-export-cleanup.cron.job';

@Command({
  name: 'cron:record-export-cleanup',
  description: 'Clean up expired exports and recover interrupted export jobs',
})
export class RecordExportCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: RecordExportCleanupCronJob.name,
      data: undefined,
      options: { repeat: { pattern: RECORD_EXPORT_CLEANUP_CRON_PATTERN } },
    });
  }
}
