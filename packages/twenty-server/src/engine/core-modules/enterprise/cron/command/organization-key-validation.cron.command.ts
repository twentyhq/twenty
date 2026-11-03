/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/organization-key-validation.cron.job';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { type EnterpriseKeyValidationCronJobData } from 'src/engine/core-modules/enterprise/types/enterprise-key-validation-cron-job-data.type';
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
    const cronPattern = getOrganizationKeyValidationCronPattern(serverId);

    await this.messageQueueService.addCron<EnterpriseKeyValidationCronJobData>({
      jobName: EnterpriseKeyValidationCronJob.name,
      data: { cronPattern },
      options: {
        repeat: {
          pattern: cronPattern,
          tz: 'UTC',
        },
      },
    });
  }
}
