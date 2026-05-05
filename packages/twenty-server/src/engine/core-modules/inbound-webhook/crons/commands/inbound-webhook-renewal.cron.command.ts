import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

import { INBOUND_WEBHOOK_RENEWAL_CRON_PATTERN } from 'src/engine/core-modules/inbound-webhook/inbound-webhook.constants';
import { InboundWebhookRenewalCronJob } from 'src/engine/core-modules/inbound-webhook/crons/jobs/inbound-webhook-renewal.cron.job';

@Command({
  name: 'cron:inbound-webhook:renewal',
  description:
    'Starts a cron job to renew inbound webhook subscriptions before they expire',
})
export class InboundWebhookRenewalCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: InboundWebhookRenewalCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: INBOUND_WEBHOOK_RENEWAL_CRON_PATTERN },
      },
    });
  }
}
