import { Logger } from '@nestjs/common';

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
    [queueName: string]: (job: MessageQueueJob) => Promise<unknown> | unknown;
  } = {};

  constructor() {}

  async add<T extends MessageQueueJobData, TResult = void>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
  ): Promise<TResult | void> {
    return await this.processJob<T, TResult>(queueName, {
      id: '',
      name: jobName,
      data,
    });
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
    await this.processJob(queueName, {
      id: '',
      name: jobName,
      // TODO: Fix this type issue
      // oxlint-disable-next-line @typescripttypescript/no-explicit-any
      data: data as any,
    });
  }

  async removeCron({ queueName }: { queueName: MessageQueue }) {
    this.logger.log(`Removing '${queueName}' cron job with SyncDriver`);
  }

  work<T extends MessageQueueJobData, TResult = void>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<TResult> | TResult,
  ): void {
    this.logger.log(`Registering handler for queue: ${queueName}`);
    this.workersMap[queueName] = handler as (
      job: MessageQueueJob,
    ) => Promise<unknown> | unknown;
  }

  async processJob<T extends MessageQueueJobData, TResult = unknown>(
    queueName: string,
    job: MessageQueueJob<T>,
  ): Promise<TResult | undefined> {
    const worker = this.workersMap[queueName];

    if (worker) {
      return (await worker(job)) as TResult;
    }

    if (process.env.NODE_ENV !== 'test') {
      this.logger.error(`No handler found for job: ${queueName}`);
    }

    return undefined;
  }
}
