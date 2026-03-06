import { Inject, Injectable } from '@nestjs/common';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  type MessageQueueJobData,
  type MessageQueueJob,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

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

  addCron<T extends MessageQueueJobData | undefined>({
    jobName,
    data,
    options,
    jobId,
  }: {
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void> {
    return this.driver.addCron({
      queueName: this.queueName,
      jobName,
      data,
      options,
      jobId,
    });
  }

  removeCron({
    jobName,
    jobId,
  }: {
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    return this.driver.removeCron({
      queueName: this.queueName,
      jobName,
      jobId,
    });
  }

  work<T extends MessageQueueJobData>(
    handler: (job: MessageQueueJob<T>) => Promise<void> | void,
    options?: MessageQueueWorkerOptions,
  ) {
    return this.driver.work(this.queueName, handler, options);
  }
}
