import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

export type WhatsappEmmitResolvedchatsJobProps = {
  docId: string;
  waDoc: WhatsappDocument;
};

@Processor({
  queueName: MessageQueue.chargeQueue,
  scope: Scope.REQUEST,
})
export class WhatsappEmmitResolvedchatsJob {
  private readonly logger = new Logger(WhatsappEmmitResolvedchatsJob.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Process(WhatsappEmmitResolvedchatsJob.name)
  async handle(data: WhatsappEmmitResolvedchatsJobProps): Promise<void> {
    this.logger.warn(`Change chat visibility ${data.docId}`);

    await this.whatsappService.handleResolvedChatsVisibility(data);
  }
}
