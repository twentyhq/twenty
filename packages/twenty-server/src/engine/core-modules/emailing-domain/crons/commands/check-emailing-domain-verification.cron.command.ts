import { Command, CommandRunner } from 'nest-commander';

import {
  CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN,
  CheckEmailingDomainVerificationCronJob,
} from 'src/engine/core-modules/emailing-domain/crons/jobs/check-emailing-domain-verification.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:emailing-domain:check-verification',
  description:
    'Starts a cron job to refresh pending emailing domain verifications hourly',
})
export class CheckEmailingDomainVerificationCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CheckEmailingDomainVerificationCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN },
      },
    });
  }
}
