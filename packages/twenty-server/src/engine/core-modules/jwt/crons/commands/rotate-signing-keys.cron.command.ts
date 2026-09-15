/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { ROTATE_SIGNING_KEYS_CRON_PATTERN } from 'src/engine/core-modules/jwt/constants/rotate-signing-keys-cron-pattern.constant';
import { RotateSigningKeysCronJob } from 'src/engine/core-modules/jwt/crons/jobs/rotate-signing-keys.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:rotate-signing-keys',
  description:
    'Starts a daily cron job that issues a fresh current JWT signing key once SIGNING_KEY_ROTATION_DAYS has elapsed. Enterprise-only.',
})
export class RotateSigningKeysCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: RotateSigningKeysCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: ROTATE_SIGNING_KEYS_CRON_PATTERN,
        },
      },
    });
  }
}
