import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { USER_SESSION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/user-session/constants/user-session-cleanup-cron-pattern.constant';
import { UserSessionCleanupCronJob } from 'src/engine/core-modules/user-session/crons/jobs/user-session-cleanup.cron.job';

@Command({
  name: 'cron:user-session:cleanup',
  description:
    'Starts a daily cron job that deletes user sessions and refresh tokens that expired or were revoked more than the retention period ago',
})
export class UserSessionCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: UserSessionCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: USER_SESSION_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
