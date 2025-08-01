import { Command, CommandRunner } from 'nest-commander';

import {
  CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN,
  CheckCustomDomainValidRecordsCronJob,
} from 'src/engine/core-modules/domain-manager/crons/jobs/check-custom-domain-valid-records.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:domain-manager:check-custom-domain-valid-records',
  description: 'Starts a cron job to check custom domain valid records hourly',
})
export class CheckCustomDomainValidRecordsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CheckCustomDomainValidRecordsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN },
      },
    });
  }
}
