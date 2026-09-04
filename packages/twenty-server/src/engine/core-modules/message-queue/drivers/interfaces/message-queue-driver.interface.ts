import { type JobState } from 'bullmq/dist/esm/types';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
  type QueueJobStatusRecipient,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<string | undefined>;
  bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    jobs: QueueJobToAdd<T>[],
    options?: QueueJobOptions,
  ): Promise<string[]>;
  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void> | void,
    options?: MessageQueueWorkerOptions,
  ): void;
  addCron<T extends MessageQueueJobData | undefined>({
    queueName,
    jobName,
    data,
    options,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void>;
  removeCron({
    queueName,
    jobName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId?: string;
  }): Promise<void>;
  register?(queueName: MessageQueue): void;
  getInFlightJobs?<T extends MessageQueueJobData>(
    queueName: MessageQueue,
  ): Promise<InFlightQueueJob<T>[]>;
  getJobs?<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<Partial<Record<string, QueueJobDetails<T>>>>;
}

export type QueueJobToAdd<T extends MessageQueueJobData> = {
  data: T;
  jobId?: string;
};

export type QueueJobDetails<T extends MessageQueueJobData> = {
  id: string;
  data: T;
  state: JobState;
  attemptsMade: number;
  failedReason?: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  broadcastStatusTo?: QueueJobStatusRecipient;
};

export interface InFlightQueueJob<T extends MessageQueueJobData> {
  id?: string;
  data: T;
}
