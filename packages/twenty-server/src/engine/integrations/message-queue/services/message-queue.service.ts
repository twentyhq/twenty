import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';

import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/integrations/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/engine/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';
import { MessageQueueJobData } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/integrations/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueService implements OnModuleDestroy {
  constructor(
    @Inject(QUEUE_DRIVER) protected driver: MessageQueueDriver,
    protected queueName: MessageQueue,
  ) {
    if (typeof this.driver.register === 'function') {
      this.driver.register(queueName);
    }
  }

  async onModuleDestroy() {
    if (typeof this.driver.stop === 'function') {
      await this.driver.stop();
    }
  }

  add<T extends MessageQueueJobData>(
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    return this.driver.add(this.queueName, jobName, data, options);
  }

  addCron<T extends MessageQueueJobData | undefined>(
    jobName: string,
    data: T,
    options?: QueueCronJobOptions,
  ): Promise<void> {
    return this.driver.addCron(this.queueName, jobName, data, options);
  }

  removeCron(jobName: string, pattern: string): Promise<void> {
    return this.driver.removeCron(this.queueName, jobName, pattern);
  }

  work<T extends MessageQueueJobData>(
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
  ) {
    return this.driver.work(this.queueName, handler);
  }
}
