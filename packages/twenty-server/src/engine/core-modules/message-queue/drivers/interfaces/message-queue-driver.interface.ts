import { type JobState } from 'bullmq/dist/esm/types';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
  type QueueJobRecipient,
  type QueueJobLimiter,
  type QueueJobScope,
  type QueueJobSettings,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import {
  type MessageQueueJob,
  type MessageQueueJobData,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { type JobMemoryReconciliation } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limiter';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueDriver {
  add<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options: QueueJobOptions,
  ): Promise<string | undefined>;
  // All or nothing across tenants: fan-outs should enqueue one batch per workspace
  bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    jobs: QueueJobToAdd<T>[],
    options?: QueueJobSettings,
  ): Promise<BulkAddResult>;
  work<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<void> | void,
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
  closeWorkers?(): Promise<void>;
  getInFlightJobs?<T extends MessageQueueJobData>(
    queueName: MessageQueue,
  ): Promise<InFlightQueueJob<T>[]>;
  reconcileJobMemory?(): Promise<JobMemoryReconciliation>;
  getJobs?<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<Partial<Record<string, QueueJobDetails<T>>>>;
}

export type QueueJobToAdd<T extends MessageQueueJobData> = {
  data: T;
  jobId?: string;
  limiter?: QueueJobLimiter;
} & QueueJobScope;

export type BulkAddResult = {
  jobs: { jobId: string; sizeBytes: number }[];
  availableBytes: number | null;
};

export type QueueJobDetails<T extends MessageQueueJobData> = {
  id: string;
  data: T;
  state: JobState;
  attemptsMade: number;
  failedReason?: string;
  progress?: unknown;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  broadcastTo?: QueueJobRecipient;
};

export interface InFlightQueueJob<T extends MessageQueueJobData> {
  id?: string;
  data: T;
}
