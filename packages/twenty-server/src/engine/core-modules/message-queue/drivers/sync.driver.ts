import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  type MessageQueueJob,
  type MessageQueueJobData,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Synchronous driver for tests and local dev
export class SyncDriver implements MessageQueueDriver {
  private readonly logger = new Logger(SyncDriver.name);
  private workersMap: {
    [queueName: string]: (job: MessageQueueJob) => Promise<void> | void;
  } = {};

  constructor() {}

  async add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
  ): Promise<void> {
    await this.processJob(queueName, this.createJob(jobName, data));
  }

  async bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    dataItems: T[],
  ): Promise<void> {
    let firstError: unknown = undefined;

    // Each payload is an independent job in BullMQ, so a failing one must not
    // prevent the others from being processed
    for (const data of dataItems) {
      try {
        await this.processJob(queueName, this.createJob(jobName, data));
      } catch (error) {
        firstError = firstError ?? error;
      }
    }

    if (isDefined(firstError)) {
      throw firstError;
    }
  }

  async addCron<T extends MessageQueueJobData | undefined>({
    queueName,
    jobName,
    data,
  }: {
    queueName: MessageQueue;
    jobName: string;
    data: T;
  }): Promise<void> {
    this.logger.log(`Running cron job with SyncDriver`);
    await this.processJob(queueName, this.createJob(jobName, data));
  }

  async removeCron({ queueName }: { queueName: MessageQueue }) {
    this.logger.log(`Removing '${queueName}' cron job with SyncDriver`);
  }

  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<void> | void,
  ): void {
    this.logger.log(`Registering handler for queue: ${queueName}`);
    this.workersMap[queueName] = handler;
  }

  async processJob<T extends MessageQueueJobData | undefined>(
    queueName: string,
    job: MessageQueueJob<T>,
  ) {
    const worker = this.workersMap[queueName];

    if (worker) {
      await worker(job);
    } else {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(`No handler found for job: ${queueName}`);
      }
    }
  }

  private createJob<T extends MessageQueueJobData | undefined>(
    name: string,
    data: T,
  ): MessageQueueJob<T> {
    const job: MessageQueueJob<T> = {
      id: '',
      name,
      data,
      retryLimit: 0,
      updateData: async (updatedData) => {
        job.data = updatedData;
      },
    };

    return job;
  }
}
