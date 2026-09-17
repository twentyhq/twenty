import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  type MessageQueueDriver,
  type QueueJobToAdd,
  type QueueJobDetails,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
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

  private readonly jobs = new Map<
    string,
    QueueJobDetails<MessageQueueJobData>
  >();

  async getJobs<TData extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<Partial<Record<string, QueueJobDetails<TData>>>> {
    return Object.fromEntries(
      jobIds.map((id) => [id, this.jobs.get(`${queueName}:${id}`)]),
    ) as Partial<Record<string, QueueJobDetails<TData>>>;
  }

  async add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
  ): Promise<string | undefined> {
    const job = this.createJob(jobName, data);

    await this.processJob(queueName, job);

    return job.id;
  }

  async bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    jobs: QueueJobToAdd<T>[],
  ): Promise<string[]> {
    let firstError: unknown = undefined;
    const jobIds: string[] = [];

    // Each payload is an independent job in BullMQ, so a failing one must not
    // prevent the others from being processed
    for (const { data, jobId } of jobs) {
      const job = this.createJob(jobName, data, jobId);

      jobIds.push(job.id);

      try {
        await this.processJob(queueName, job);
      } catch (error) {
        firstError = firstError ?? error;
      }
    }

    if (isDefined(firstError)) {
      throw firstError;
    }

    return jobIds;
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
    handler: (job: MessageQueueJob<T>) => Promise<unknown> | unknown,
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
      const details: QueueJobDetails<MessageQueueJobData> = {
        id: job.id,
        data: job.data ?? {},
        state: 'active',
        attemptsMade: 0,
        timestamp: Date.now(),
        processedOn: Date.now(),
      };
      this.jobs.set(`${queueName}:${job.id}`, details);
      job.updateProgress = async (progress) => {
        details.progress = progress;
      };
      try {
        details.result = await worker(job);
        details.state = 'completed';
      } catch (error) {
        details.state = 'failed';
        details.failedReason =
          error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        details.finishedOn = Date.now();
        details.attemptsMade++;
        for (const [key, entry] of this.jobs) {
          if (
            entry.state !== 'active' &&
            (this.jobs.size > 1000 ||
              Date.now() - entry.timestamp > 4 * 60 * 60 * 1000)
          ) {
            this.jobs.delete(key);
          }
        }
      }
    } else {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(`No handler found for job: ${queueName}`);
      }
    }
  }

  private createJob<T extends MessageQueueJobData | undefined>(
    name: string,
    data: T,
    jobId?: string,
  ): MessageQueueJob<T> {
    const job: MessageQueueJob<T> = {
      id: jobId ?? v4(),
      name,
      data,
      retryLimit: 0,
      updateProgress: async () => {},
      updateData: async (updatedData) => {
        job.data = updatedData;
      },
    };

    return job;
  }
}
