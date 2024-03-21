import { Queue, QueueOptions, Worker } from 'bullmq';

import { QueueJobOptions } from 'src/engine/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

import { MessageQueueDriver } from './interfaces/message-queue-driver.interface';

export type BullMQDriverOptions = QueueOptions;

export class BullMQDriver implements MessageQueueDriver {
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

  async stop() {
    const workers = Object.values(this.workerMap);
    const queues = Object.values(this.queueMap);

    await Promise.all([
      ...queues.map((q) => q.close()),
      ...workers.map((w) => w.close()),
    ]);
  }

  async work<T>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void>,
  ) {
    const worker = new Worker(
      queueName,
      async (job) => {
        await handler(job as { data: T; id: string });
      },
      {
        ...this.options,
        concurrency: 10,
      },
    );

    this.workerMap[queueName] = worker;
  }

  async addCron<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    pattern: string,
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }
    const queueOptions = {
      jobId: options?.id,
      priority: options?.priority,
      repeat: {
        pattern,
      },
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
    const queueOptions = {
      jobId: options?.id,
      priority: options?.priority,
      attempts: 1 + (options?.retryLimit || 0),
    };

    await this.queueMap[queueName].add(jobName, data, queueOptions);
  }
}
