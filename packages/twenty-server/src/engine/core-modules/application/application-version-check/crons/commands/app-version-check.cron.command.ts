import { Command, CommandRunner } from 'nest-commander';

import { APP_VERSION_CHECK_CRON_PATTERN } from 'src/engine/core-modules/application/application-version-check/crons/constants/app-version-check-cron-pattern.constant';
import { AppVersionCheckCronJob } from 'src/engine/core-modules/application/application-version-check/crons/app-version-check.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:app-version-check',
  description:
    'Starts a cron job to check for app version updates on npm registries',
})
export class AppVersionCheckCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: AppVersionCheckCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: APP_VERSION_CHECK_CRON_PATTERN,
        },
      },
    });
  }
}
