import {
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import * as Sentry from '@sentry/node';
import {
  type JobsOptions,
  MetricsTime,
  Queue,
  type QueueOptions,
  Worker,
} from 'bullmq';
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
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
  private workerOptionsMap: Partial<
    Record<MessageQueue, MessageQueueWorkerOptions>
  > = {};

  constructor(
    private options: BullMQDriverOptions,
    private metricsService: MetricsService,
    private twentyConfigService: TwentyConfigService,
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
    const workers = Object.entries(this.workerMap) as [MessageQueue, Worker][];
    const queues = Object.values(this.queueMap);

    if (workers.length > 0) {
      this.logger.log(
        `Draining active jobs on queues: ${workers.map(([queueName]) => queueName).join(', ')}`,
      );
    }

    let workerCloseError: unknown;

    try {
      await Promise.all(
        workers.map(([queueName, worker]) =>
          this.closeWorker(queueName, worker),
        ),
      );
    } catch (error) {
      workerCloseError = error;
    }

    try {
      await Promise.all(queues.map((queue) => queue.close()));
    } catch (error) {
      if (!isDefined(workerCloseError)) {
        throw error;
      }

      this.logger.error(
        `Failed to close queues during shutdown: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (isDefined(workerCloseError)) {
      throw workerCloseError;
    }

    this.logger.log('Message queue shutdown complete');
  }

  private async closeWorker(
    queueName: MessageQueue,
    worker: Worker,
  ): Promise<void> {
    if (!this.workerOptionsMap[queueName]?.boundedShutdownDrain) {
      await worker.close();

      return;
    }

    const shutdownTimeoutMs = this.twentyConfigService.get(
      'AI_STREAM_SHUTDOWN_DRAIN_MS',
    );

    const abortTimer = setTimeout(() => {
      this.logger.warn(
        `Queue ${queueName} still has active jobs after draining for ${shutdownTimeoutMs}ms, aborting them`,
      );
      worker.cancelAllJobs('worker shutdown');
    }, shutdownTimeoutMs);

    try {
      await worker.close();
    } finally {
      clearTimeout(abortTimer);
    }
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
      ...(isDefined(options?.lockDuration)
        ? { lockDuration: options.lockDuration }
        : {}),
      ...(isDefined(options?.maxStalledCount)
        ? { maxStalledCount: options.maxStalledCount }
        : {}),
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK,
        collectInterval: 60000,
      },
    };

    this.workerOptionsMap[queueName] = options;

    this.workerMap[queueName] = new Worker(
      queueName,
      async (job, _token, abortSignal) =>
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
          await handler({
            data: job.data,
            id: job.id ?? '',
            name: job.name,
            abortSignal,
          });
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
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    // --- Idempotency-key path (native BullMQ dedup) ---
    // When an idempotencyKey is set, pass it verbatim as the BullMQ jobId.
    // BullMQ natively dedupes on jobId: a second add() with the same jobId
    // is a no-op while any job with that id exists (waiting, active, or
    // within the removeOnComplete/removeOnFail retention window). The custom
    // waiting-job guard below is intentionally skipped – it would mangle the
    // verbatim key by stripping a V4 suffix.
    //
    // Note: once a job completes and is removed after the retention window,
    // the same idempotencyKey becomes available again, which enables
    // at-least-once re-delivery for downstream consumers.
    if (options?.idempotencyKey) {
      const queueOptions: JobsOptions = {
        jobId: options.idempotencyKey,
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

      await this.queueMap[queueName].add(jobName, data, queueOptions);
      return;
    }

    // --- Legacy id-based guard path ---
    // This ensures only one waiting job can be queued for a specific option.id.
    // Each job gets a unique V4 suffix on its id so that a running job does not
    // prevent a new waiting job with the same option.id from being enqueued.
    if (options?.id) {
      const waitingJobs = await this.queueMap[queueName].getJobs(['waiting']);

      const isJobAlreadyWaiting = waitingJobs.some(
        (job) => job.id?.slice(0, -(V4_LENGTH + 1)) === options.id,
      );

      if (isJobAlreadyWaiting) {
        return;
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

    await this.queueMap[queueName].add(jobName, data, queueOptions);
  }

  /** Expose a registered Queue for direct BullMQ operations (e.g. DLQ redrive). */
  getQueue(queueName: MessageQueue): Queue {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    return this.queueMap[queueName];
  }
}
