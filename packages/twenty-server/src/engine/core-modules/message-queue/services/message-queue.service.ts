import { Inject, Injectable } from '@nestjs/common';

import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  MessageQueueJobData,
  MessageQueueJob,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueService {
  constructor(
    @Inject(QUEUE_DRIVER) protected driver: MessageQueueDriver,
    protected queueName: MessageQueue,
  ) {
    if (typeof this.driver.register === 'function') {
      this.driver.register(queueName);
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
    handler: (job: MessageQueueJob<T>) => Promise<void> | void,
    options?: MessageQueueWorkerOptions,
  ) {
    return this.driver.work(this.queueName, handler, options);
  }
}
