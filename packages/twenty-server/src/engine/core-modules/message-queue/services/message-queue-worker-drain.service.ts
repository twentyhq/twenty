import { Inject, Injectable } from '@nestjs/common';

import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';

import { QUEUE_DRIVER } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueWorkerDrainService {
  constructor(
    @Inject(QUEUE_DRIVER) private readonly driver: MessageQueueDriver,
  ) {}

  async drainWorkers(): Promise<void> {
    await this.driver.closeWorkers?.();
  }
}
