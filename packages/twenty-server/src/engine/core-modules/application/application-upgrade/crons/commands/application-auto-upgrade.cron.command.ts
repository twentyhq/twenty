import { Command, CommandRunner } from 'nest-commander';

import { ApplicationAutoUpgradeCronJob } from 'src/engine/core-modules/application/application-upgrade/crons/application-auto-upgrade.cron.job';
import { APPLICATION_AUTO_UPGRADE_CRON_PATTERN } from 'src/engine/core-modules/application/application-upgrade/crons/constants/application-auto-upgrade-cron-pattern.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:application-auto-upgrade',
  description:
    'Starts a cron job that enqueues pending auto-upgrades within the Lambda management budget',
})
export class ApplicationAutoUpgradeCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ApplicationAutoUpgradeCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: APPLICATION_AUTO_UPGRADE_CRON_PATTERN,
        },
      },
    });
  }
}
