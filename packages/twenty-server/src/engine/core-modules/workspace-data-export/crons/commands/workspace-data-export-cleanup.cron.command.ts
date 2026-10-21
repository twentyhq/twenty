import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WORKSPACE_DATA_EXPORT_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportCleanupCronJob } from 'src/engine/core-modules/workspace-data-export/crons/jobs/workspace-data-export-cleanup.cron.job';

@Command({
  name: 'cron:workspace-data-export-cleanup',
  description:
    'Starts a cron job to delete expired and abandoned workspace data exports',
})
export class WorkspaceDataExportCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WorkspaceDataExportCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKSPACE_DATA_EXPORT_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
