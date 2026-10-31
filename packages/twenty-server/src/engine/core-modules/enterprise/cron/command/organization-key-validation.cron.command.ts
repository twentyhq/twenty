/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/organization-key-validation.cron.job';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { getOrganizationKeyValidationCronPattern } from 'src/engine/core-modules/enterprise/utils/get-organization-key-validation-cron-pattern.util';
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
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const serverId = await this.enterprisePlanService.getOrCreateServerId();

    await this.messageQueueService.addCron<undefined>({
      jobName: EnterpriseKeyValidationCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: getOrganizationKeyValidationCronPattern(serverId),
          tz: 'UTC',
        },
      },
    });
  }
}
