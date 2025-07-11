import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

export type WhatsappEmmitWaitingStatusJobProps = {
  docId: string;
  waDoc: WhatsappDocument;
};

@Processor({
  queueName: MessageQueue.chargeQueue,
  scope: Scope.REQUEST,
})
export class WhatsappEmmitWaitingStatusJob {
  private readonly logger = new Logger(WhatsappEmmitWaitingStatusJob.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Process(WhatsappEmmitWaitingStatusJob.name)
  async handle(data: WhatsappEmmitWaitingStatusJobProps): Promise<void> {
    this.logger.warn(`Change chat status ${data.docId}`);

    await this.whatsappService.handleChatsWaitingStatus(data);
  }
}
