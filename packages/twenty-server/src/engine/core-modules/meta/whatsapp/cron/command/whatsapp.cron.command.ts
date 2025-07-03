import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WhatsappEmmitResolvedChatsCronJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-chats-emmit-resolved-status.cron.job';
import { WhatsappEmmitWaitingChatsCronJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-chats-emmit-waiting-status.cron.job';
import { WHATSAPP_EMMIT_CRON_PATTERN } from 'src/engine/core-modules/meta/whatsapp/cron/utils/whatsapp-emmit-cron-pattern';

@Command({
  name: 'cron:whatsapp-change-status-command',
  description:
    'Starts a cron job to check for changes in Whatsapp Firebase Documment',
})
export class WhatsappCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WhatsappEmmitWaitingChatsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: WHATSAPP_EMMIT_CRON_PATTERN },
      },
    });

    await this.messageQueueService.addCron<undefined>({
      jobName: WhatsappEmmitResolvedChatsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: WHATSAPP_EMMIT_CRON_PATTERN },
      },
    });
  }
}
