import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { METADATA_REMOVAL_RETENTION_CRON_PATTERN } from 'src/engine/core-modules/metadata-removal-retention/constants/metadata-removal-retention-cron-pattern.constant';
import { MetadataRemovalRetentionCronJob } from 'src/engine/core-modules/metadata-removal-retention/crons/metadata-removal-retention.cron.job';

@Command({
  name: 'cron:metadata-removal-retention',
  description:
    'Starts a cron job to permanently drop columns and tables removed by application deploys once their retention period has elapsed',
})
export class MetadataRemovalRetentionCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MetadataRemovalRetentionCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: METADATA_REMOVAL_RETENTION_CRON_PATTERN,
        },
      },
    });
  }
}
