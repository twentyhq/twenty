import { OnModuleDestroy } from '@nestjs/common';

import { JobsOptions, Queue, QueueOptions, Worker } from 'bullmq';
import omitBy from 'lodash.omitby';

import {
  QueueCronJobOptions,
  QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type BullMQDriverOptions = QueueOptions;

export class BullMQDriver implements MessageQueueDriver, OnModuleDestroy {
  private queueMap: Record<MessageQueue, Queue> = {} as Record<
    MessageQueue,
    Queue
  >;
  private workerMap: Record<MessageQueue, Worker> = {} as Record<
    MessageQueue,
    Worker
  >;

  constructor(private options: BullMQDriverOptions) {}

  register(queueName: MessageQueue): void {
    this.queueMap[queueName] = new Queue(queueName, this.options);
  }

  async onModuleDestroy() {
    const workers = Object.values(this.workerMap);
    const queues = Object.values(this.queueMap);

    await Promise.all([
      ...queues.map((q) => q.close()),
      ...workers.map((w) => w.close()),
    ]);
  }

  async work<T>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<void>,
    options?: MessageQueueWorkerOptions,
  ) {
    const worker = new Worker(
      queueName,
      async (job) => {
        // TODO: Correctly support for job.id
        await handler({ data: job.data, id: job.id ?? '', name: job.name });
      },
      omitBy(
        {
          ...this.options,
          concurrency: options?.concurrency,
        },
        (value) => value === undefined,
      ),
    );

    this.workerMap[queueName] = worker;
  }

  async addCron<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueCronJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }
    const queueOptions: JobsOptions = {
      jobId: options?.id,
      priority: options?.priority,
      repeat: options?.repeat,
      removeOnComplete: 100,
      removeOnFail: 500,
    };

    await this.queueMap[queueName].add(jobName, data, queueOptions);
  }

  async removeCron(
    queueName: MessageQueue,
    jobName: string,
    pattern: string,
  ): Promise<void> {
    await this.queueMap[queueName].removeRepeatable(jobName, {
      pattern,
    });
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }
    const queueOptions: JobsOptions = {
      jobId: options?.id,
      priority: options?.priority,
      attempts: 1 + (options?.retryLimit || 0),
      removeOnComplete: 100,
      removeOnFail: 500,
    };

    await this.queueMap[queueName].add(jobName, data, queueOptions);
  }
}
