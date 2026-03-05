/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { ENTERPRISE_KEY_VALIDATION_CRON_PATTERN } from 'src/engine/core-modules/enterprise/constants/enterprise-key-validation-cron-pattern.constant';
import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/enterprise-key-validation.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:enterprise-key-validation',
  description:
    'Starts a daily cron job to refresh the enterprise  validity token',
})
export class EnterpriseKeyValidationCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: EnterpriseKeyValidationCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: ENTERPRISE_KEY_VALIDATION_CRON_PATTERN,
        },
      },
    });
  }
}
