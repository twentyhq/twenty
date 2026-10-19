import { Inject, Injectable, Logger } from '@nestjs/common';

import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';

import { QUEUE_DRIVER } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueWorkerDrainService {
  private readonly logger = new Logger(MessageQueueWorkerDrainService.name);

  constructor(
    @Inject(QUEUE_DRIVER) private readonly driver: MessageQueueDriver,
  ) {}

  async drainWorkers(): Promise<void> {
    try {
      await this.driver.closeWorkers?.();
    } catch (error) {
      this.logger.error(
        'Failed to drain queue workers, continuing shutdown',
        error,
      );
    }
  }
}
