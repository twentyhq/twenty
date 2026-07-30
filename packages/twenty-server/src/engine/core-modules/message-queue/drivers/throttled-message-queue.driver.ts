import {
  type QueueCronJobOptions,
  type QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import {
  type InFlightQueueJob,
  type MessageQueueDriver,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type JobEnqueueThrottlerGuard } from 'src/engine/core-modules/message-queue/guards/job-enqueue-throttler.guard';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Wraps any concrete driver so the enqueue guard runs uniformly across drivers.
export class ThrottledMessageQueueDriver implements MessageQueueDriver {
  constructor(
    private readonly driver: MessageQueueDriver,
    private readonly guard: JobEnqueueThrottlerGuard,
  ) {}

  async add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    await this.guard.assertCanEnqueueOrThrow(queueName, 1);

    return this.driver.add(queueName, jobName, data, options);
  }

  async bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    dataItems: T[],
    options?: QueueJobOptions,
  ): Promise<void> {
    if (dataItems.length > 0) {
      await this.guard.assertCanEnqueueOrThrow(queueName, dataItems.length);
    }

    return this.driver.bulkAdd(queueName, jobName, dataItems, options);
  }

  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
    options?: MessageQueueWorkerOptions,
  ): void {
    this.driver.work(queueName, handler, options);
  }

  addCron<T extends MessageQueueJobData | undefined>(params: {
    queueName: MessageQueue;
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void> {
    return this.driver.addCron(params);
  }

  removeCron(params: {
    queueName: MessageQueue;
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    return this.driver.removeCron(params);
  }

  register(queueName: MessageQueue): void {
    this.driver.register?.(queueName);
  }

  getInFlightJobs<T extends MessageQueueJobData>(
    queueName: MessageQueue,
  ): Promise<InFlightQueueJob<T>[]> {
    if (typeof this.driver.getInFlightJobs !== 'function') {
      return Promise.resolve([]);
    }

    return this.driver.getInFlightJobs(queueName);
  }
}
