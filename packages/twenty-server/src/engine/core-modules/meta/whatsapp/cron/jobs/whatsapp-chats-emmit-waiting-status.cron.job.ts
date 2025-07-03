import { Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WhatsappEmmitWaitingStatusJob,
  WhatsappEmmitWaitingStatusJobProps,
} from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { WHATSAPP_EMMIT_CRON_PATTERN } from 'src/engine/core-modules/meta/whatsapp/cron/utils/whatsapp-emmit-cron-pattern';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

@Processor(MessageQueue.cronQueue)
export class WhatsappEmmitWaitingChatsCronJob {
  private readonly logger = new Logger(WhatsappEmmitWaitingChatsCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Process(WhatsappEmmitWaitingChatsCronJob.name)
  @SentryCronMonitor(
    WhatsappEmmitWaitingChatsCronJob.name,
    WHATSAPP_EMMIT_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking whatsapp chats to change status emmit`);

    const whatsappChatsToReassignMap =
      (await this.whatsappService.getWorkspaceWhatsappChatsMapToReassign()) ??
      {};

    const whatsappChatsMapMapList = Object.entries(whatsappChatsToReassignMap);

    if (whatsappChatsMapMapList.length === 0) {
      this.logger.warn(`No whatsapp chats found to change status emmit`);

      return;
    }

    this.logger.log(
      `Found ${whatsappChatsMapMapList.length} chats with status in progress to emmit`,
    );

    for (const whatsappChatsMapMap of whatsappChatsMapMapList) {
      const [docId, waDocs] = whatsappChatsMapMap;

      await Promise.all(
        waDocs.map((waDoc) =>
          this.messageQueueService.add<WhatsappEmmitWaitingStatusJobProps>(
            WhatsappEmmitWaitingStatusJob.name,
            {
              docId,
              waDoc,
            },
          ),
        ),
      );
    }
  }
}
