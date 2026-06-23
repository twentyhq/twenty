import {
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import * as Sentry from '@sentry/node';
import {
  type Job,
  type JobsOptions,
  type JobType,
  MetricsTime,
  Queue,
  QueueEvents,
  type QueueOptions,
  Worker,
} from 'bullmq';
import IORedis from 'ioredis';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  type QueueCronJobOptions,
  type QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { QUEUE_RETENTION } from 'src/engine/core-modules/message-queue/constants/queue-retention.constants';
import { MESSAGE_QUEUE_PRIORITY } from 'src/engine/core-modules/message-queue/message-queue-priority.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getJobKey } from 'src/engine/core-modules/message-queue/utils/get-job-key.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { applyWorkspaceSentryContextFromJobData } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-context-from-job-data.util';

export type BullMQDriverOptions = QueueOptions;

const V4_LENGTH = 36;

export class BullMQDriver
  implements MessageQueueDriver, OnModuleDestroy, OnModuleInit
{
  private logger = new Logger(BullMQDriver.name);
  private queueMap: Record<MessageQueue, Queue> = {} as Record<
    MessageQueue,
    Queue
  >;
  private workerMap: Record<MessageQueue, Worker> = {} as Record<
    MessageQueue,
    Worker
  >;
  private queueEventsMap: Partial<Record<MessageQueue, QueueEvents>> = {};

  private readonly PENDING_JOB_STATUSES = [
    'wait',
    'active',
    'delayed',
    'prioritized',
    'waiting-children',
  ] as const satisfies JobType[];

  constructor(
    private options: BullMQDriverOptions,
    private metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_jobs_waiting_total',
      options: { description: 'Current number of jobs waiting in queue' },
      callback: async () => {
        const observations: Array<{
          value: number;
          attributes: { queue: string };
        }> = [];

        for (const [queueName, queue] of Object.entries(this.queueMap)) {
          try {
            const waitingCount = await queue.count();

            observations.push({
              value: waitingCount,
              attributes: { queue: queueName },
            });
          } catch (error) {
            this.logger.error(
              `Failed to collect waiting jobs metrics for queue ${queueName}`,
              error,
            );
          }
        }

        return observations;
      },
    });
  }

  register(queueName: MessageQueue): void {
    this.queueMap[queueName] = new Queue(queueName, this.options);
  }

  async onModuleDestroy() {
    const workers = Object.values(this.workerMap);
    const queues = Object.values(this.queueMap);
    const queueEvents = Object.values(this.queueEventsMap).filter(isDefined);

    await Promise.all([
      ...queues.map((q) => q.close()),
      ...workers.map((w) => w.close()),
      ...queueEvents.map((events) => events.close()),
    ]);
  }

  // QueueEvents drives waitUntilFinished and needs its own blocking connection,
  // so it is created lazily (only for callers that await a job) by duplicating
  // the shared client.
  private getQueueEvents(queueName: MessageQueue): QueueEvents {
    const existingQueueEvents = this.queueEventsMap[queueName];

    if (isDefined(existingQueueEvents)) {
      return existingQueueEvents;
    }

    const connection = (this.options.connection as IORedis).duplicate();
    const queueEvents = new QueueEvents(queueName, { connection });

    this.queueEventsMap[queueName] = queueEvents;

    return queueEvents;
  }

  work<T>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<void>,
    options?: MessageQueueWorkerOptions,
  ) {
    const workerOptions = {
      ...this.options,
      ...(isDefined(options?.concurrency)
        ? { concurrency: options.concurrency }
        : {}),
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK,
        collectInterval: 60000,
      },
    };

    this.workerMap[queueName] = new Worker(
      queueName,
      async (job) =>
        Sentry.withIsolationScope(async () => {
          applyWorkspaceSentryContextFromJobData(job.data);

          const queueLatency = Math.max(0, Date.now() - job.timestamp);

          this.metricsService.recordHistogram({
            key: MetricsKeys.JobLatencyMs,
            value: queueLatency,
            unit: 'ms',
            attributes: { queue: queueName, job_name: job.name },
          });

          // TODO: Correctly support for job.id
          const timeStart = performance.now();
          const workspaceId = job.data?.workspaceId;
          const workspaceSuffix = workspaceId
            ? ` [workspace=${workspaceId}]`
            : '';

          this.logger.log(
            `Processing job ${job.id} with name ${job.name} on queue ${queueName}${workspaceSuffix}`,
          );
          await handler({ data: job.data, id: job.id ?? '', name: job.name });
          const timeEnd = performance.now();
          const executionTime = timeEnd - timeStart;

          this.logger.log(
            `Job ${job.id} with name ${job.name} processed on queue ${queueName} in ${executionTime.toFixed(2)}ms${workspaceSuffix}`,
          );
        }),
      workerOptions,
    );

    this.workerMap[queueName].on('completed', (job) => {
      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobCompleted,
        attributes: { queue: queueName, job_name: job?.name ?? '' },
        shouldStoreInCache: false,
      });
    });

    this.workerMap[queueName].on('failed', (job, error) => {
      if (!isDefined(job) || !isDefined(error)) {
        return;
      }

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobFailed,
        attributes: {
          queue: queueName,
          job_name: job.name,
          error_type: error.name,
        },
        shouldStoreInCache: false,
      });
    });
  }

  async addCron<T>({
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
  }): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    const queueOptions: JobsOptions = {
      priority: options?.priority,
      repeat: options?.repeat,
      removeOnComplete: {
        age: QUEUE_RETENTION.completedMaxAge,
        count: QUEUE_RETENTION.completedMaxCount,
      },
      removeOnFail: {
        age: QUEUE_RETENTION.failedMaxAge,
        count: QUEUE_RETENTION.failedMaxCount,
      },
    };

    await this.queueMap[queueName].upsertJobScheduler(
      getJobKey({ jobName, jobId }),
      options?.repeat,
      {
        name: jobName,
        data,
        opts: queueOptions,
      },
    );
  }

  async removeCron({
    queueName,
    jobName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    await this.queueMap[queueName].removeJobScheduler(
      getJobKey({ jobName, jobId }),
    );
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    await this.enqueueJob(queueName, jobName, data, options);
  }

  // Enqueues a job and resolves once the worker finishes it, using BullMQ's
  // native job event stream (QueueEvents). Rejects if the job fails.
  async addAndWaitForCompletion<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    const job = await this.enqueueJob(queueName, jobName, data, options);

    if (!isDefined(job)) {
      return;
    }

    await job.waitUntilFinished(this.getQueueEvents(queueName));
  }

  // Resolves once every queue has no pending work, debounced by idleMs to bridge
  // the gap between a job finishing and its continuation being enqueued.
  async waitForIdle({
    timeoutMs = 30_000,
    idleMs = 250,
    pollMs = 25,
  }: {
    timeoutMs?: number;
    idleMs?: number;
    pollMs?: number;
  } = {}): Promise<void> {
    const queues = Object.values(this.queueMap);
    const deadline = Date.now() + timeoutMs;
    let idleSince: number | null = null;

    for (;;) {
      const pendingCounts = await Promise.all(
        queues.map(async (queue) => {
          const counts = await queue.getJobCounts(...this.PENDING_JOB_STATUSES);

          return this.PENDING_JOB_STATUSES.reduce(
            (sum, status) => sum + (counts[status] ?? 0),
            0,
          );
        }),
      );
      const totalPending = pendingCounts.reduce((sum, count) => sum + count, 0);

      if (totalPending === 0) {
        idleSince ??= Date.now();

        if (Date.now() - idleSince >= idleMs) {
          return;
        }
      } else {
        idleSince = null;

        if (Date.now() >= deadline) {
          throw new Error(
            `Queues did not become idle within ${timeoutMs}ms (pending: ${totalPending})`,
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  }

  private async enqueueJob<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<Job | undefined> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    // This ensures only one waiting job can be queued for a specific option.id
    if (options?.id) {
      const waitingJobs = await this.queueMap[queueName].getJobs(['waiting']);

      const isJobAlreadyWaiting = waitingJobs.some(
        (job) => job.id?.slice(0, -(V4_LENGTH + 1)) === options.id,
      );

      if (isJobAlreadyWaiting) {
        return undefined;
      }
    }

    const queueOptions: JobsOptions = {
      jobId: options?.id ? `${options.id}-${v4()}` : undefined, // We add V4() to id to make sure ids are uniques so we can add a waiting job when a job related with the same option.id is running
      priority: options?.priority ?? MESSAGE_QUEUE_PRIORITY[queueName],
      attempts: 1 + (options?.retryLimit || 0),
      removeOnComplete: {
        age: QUEUE_RETENTION.completedMaxAge,
        count: QUEUE_RETENTION.completedMaxCount,
      },
      removeOnFail: {
        age: QUEUE_RETENTION.failedMaxAge,
        count: QUEUE_RETENTION.failedMaxCount,
      },
      delay: options?.delay,
    };

    return this.queueMap[queueName].add(jobName, data, queueOptions);
  }
}
