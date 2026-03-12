import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { STALE_REGISTRATION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/constants/stale-registration-cleanup-cron-pattern.constant';
import { StaleRegistrationCleanupCronJob } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/crons/stale-registration-cleanup.cron.job';

@Command({
  name: 'cron:stale-registration-cleanup',
  description:
    'Starts a cron job to clean up stale OAuth-only application registrations',
})
export class StaleRegistrationCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: StaleRegistrationCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: STALE_REGISTRATION_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
