import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN,
  CheckPublicDomainsValidRecordsCronJob,
} from 'src/engine/core-modules/public-domain/crons/jobs/check-public-domains-valid-records.cron.job';

@Command({
  name: 'cron:public-domain:check-public-domains-valid-records',
  description:
    'Starts a cron job to check workspace public domains valid records hourly',
})
export class CheckPublicDomainsValidRecordsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CheckPublicDomainsValidRecordsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN },
      },
    });
  }
}
