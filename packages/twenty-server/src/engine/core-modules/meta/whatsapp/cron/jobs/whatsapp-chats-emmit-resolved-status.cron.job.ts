import { Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WhatsappEmmitResolvedchatsJob,
  WhatsappEmmitResolvedchatsJobProps,
} from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-resolved-chats.job';
import { WHATSAPP_EMMIT_CRON_PATTERN } from 'src/engine/core-modules/meta/whatsapp/cron/utils/whatsapp-emmit-cron-pattern';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

@Processor(MessageQueue.cronQueue)
export class WhatsappEmmitResolvedChatsCronJob {
  private readonly logger = new Logger(WhatsappEmmitResolvedChatsCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.chargeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Process(WhatsappEmmitResolvedChatsCronJob.name)
  @SentryCronMonitor(
    WhatsappEmmitResolvedChatsCronJob.name,
    WHATSAPP_EMMIT_CRON_PATTERN,
  )
  async handle() {
    this.logger.warn(`Checking resolved whatsapp chats to emmit`);

    const whatsappChatsToReassignMap =
      (await this.whatsappService.getWorkspaceWhatsappResolvedChatsMapToReassign()) ??
      {};

    const whatsappChatsMapMapList = Object.entries(whatsappChatsToReassignMap);

    if (whatsappChatsMapMapList.length === 0) {
      this.logger.warn(`No resolved whatsapp chats found to emmit`);

      return;
    }

    this.logger.log(
      `Found ${whatsappChatsMapMapList.length} resolved chats with visibility to emmit`,
    );

    for (const whatsappChatsMapMap of whatsappChatsMapMapList) {
      const [docId, waDocs] = whatsappChatsMapMap;

      await Promise.all(
        waDocs.map((waDoc) =>
          this.messageQueueService.add<WhatsappEmmitResolvedchatsJobProps>(
            WhatsappEmmitResolvedchatsJob.name,
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
