/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { USAGE_LIMIT_INSTANCE_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/usage-limit/instance-override/constants/usage-limit-instance-override-expiry.cron-pattern.constant';
import { UsageLimitInstanceOverrideExpiryCronJob } from 'src/engine/core-modules/usage-limit/instance-override/crons/usage-limit-instance-override-expiry.cron.job';

@Command({
  name: 'cron:usage-limit:instance-override-expiry',
  description:
    'Starts a cron job to remove the usage limits of ended limit override arrangements',
})
export class UsageLimitInstanceOverrideExpiryCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: UsageLimitInstanceOverrideExpiryCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: USAGE_LIMIT_INSTANCE_OVERRIDE_EXPIRY_CRON_PATTERN },
      },
    });
  }
}
