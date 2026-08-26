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
import {
  type InFlightQueueJob,
  type MessageQueueDriver,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  type MessageQueueJob,
  type MessageQueueJobData,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { QUEUE_RETENTION } from 'src/engine/core-modules/message-queue/constants/queue-retention.constants';
import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getJobKey } from 'src/engine/core-modules/message-queue/utils/get-job-key.util';
import { getWorkspaceIdFromJobData } from 'src/engine/core-modules/message-queue/utils/get-workspace-id-from-job-data.util';
import { JOB_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/job-duration-ms-bucket-boundaries.constant';
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

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_jobs_by_state_total',
      options: {
        description: 'Current number of jobs in queue broken down by state',
      },
      callback: async () => {
        const observations: Array<{
          value: number;
          attributes: { queue: string; state: string };
        }> = [];

        for (const [queueName, queue] of Object.entries(this.queueMap)) {
          try {
            const jobCounts = await queue.getJobCounts(
              'active',
              'waiting',
              'prioritized',
              'delayed',
              'failed',
            );

            for (const [state, count] of Object.entries(jobCounts)) {
              observations.push({
                value: count,
                attributes: { queue: queueName, state },
              });
            }
          } catch (error) {
            this.logger.error(
              `Failed to collect job state metrics for queue ${queueName}`,
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

          const workspaceId = getWorkspaceIdFromJobData(job.data);
          const jobAttributes = {
            queue: queueName,
            job_name: job.name,
            ...(isDefined(workspaceId) && { workspace_id: workspaceId }),
          };

          const queueLatency = Math.max(
            0,
            Date.now() - job.timestamp - (job.delay ?? 0),
          );

          this.metricsService.recordHistogram({
            key: MetricsKeys.JobLatencyMs,
            value: queueLatency,
            unit: 'ms',
            attributes: jobAttributes,
            bucketBoundaries: JOB_DURATION_MS_BUCKET_BOUNDARIES,
          });

          // TODO: Correctly support for job.id
          const timeStart = performance.now();
          const workspaceSuffix = workspaceId
            ? ` [workspace=${workspaceId}]`
            : '';

          this.logger.log(
            `Processing job ${job.id} with name ${job.name} on queue ${queueName}${workspaceSuffix}`,
          );

          let jobSucceeded = false;

          try {
            await handler({
              data: job.data,
              id: job.id ?? '',
              name: job.name,
              retryLimit: Math.max(0, (job.opts.attempts ?? 1) - 1),
              updateData: (data) => job.updateData(data),
              abortSignal,
            });
            jobSucceeded = true;
          } finally {
            const executionTime = performance.now() - timeStart;
            const attributes = {
              ...jobAttributes,
              status: jobSucceeded ? 'completed' : 'failed',
            };

            this.metricsService.recordHistogram({
              key: MetricsKeys.JobExecutionDurationMs,
              value: executionTime,
              unit: 'ms',
              attributes,
              bucketBoundaries: JOB_DURATION_MS_BUCKET_BOUNDARIES,
            });

            this.metricsService.recordHistogram({
              key: MetricsKeys.JobTotalDurationMs,
              value: queueLatency + executionTime,
              unit: 'ms',
              attributes,
              bucketBoundaries: JOB_DURATION_MS_BUCKET_BOUNDARIES,
            });

            if (jobSucceeded) {
              this.logger.log(
                `Job ${job.id} with name ${job.name} processed on queue ${queueName} in ${executionTime.toFixed(2)}ms${workspaceSuffix}`,
              );
            }
          }
        }),
      workerOptions,
    );

    this.workerMap[queueName].on('completed', (job) => {
      const workspaceId = getWorkspaceIdFromJobData(job?.data);

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobCompleted,
        attributes: {
          queue: queueName,
          job_name: job?.name ?? '',
          ...(isDefined(workspaceId) && { workspace_id: workspaceId }),
        },
        shouldStoreInCache: false,
      });
    });

    this.workerMap[queueName].on('failed', (job, error) => {
      if (!isDefined(job) || !isDefined(error)) {
        return;
      }

      const workspaceId = getWorkspaceIdFromJobData(job.data);

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobFailed,
        attributes: {
          queue: queueName,
          job_name: job.name,
          error_type: error.name,
          ...(isDefined(workspaceId) && { workspace_id: workspaceId }),
        },
        shouldStoreInCache: false,
      });
    });

    this.workerMap[queueName].on('stalled', (jobId) => {
      this.logger.warn(
        `Job ${jobId} stalled on queue ${queueName}: its worker stopped processing it without completing or failing it`,
      );

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobStalled,
        attributes: { queue: queueName },
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

  private buildJobsOptions({
    queueName,
    options,
  }: {
    queueName: MessageQueue;
    options?: QueueJobOptions;
  }): JobsOptions {
    return {
      // We suffix the id with V4() to make sure ids are unique so we can add a waiting job when a job related with the same option.id is running
      jobId: options?.id ? `${options.id}-${v4()}` : undefined,
      priority:
        options?.priority ?? MESSAGE_QUEUE_WORKER_CONFIG[queueName].priority,
      attempts: 1 + (options?.retryLimit || 0),
      backoff: options?.backoff
        ? {
            type: options.backoff.strategy,
            delay: options.backoff.initialDelayMilliseconds,
            jitter: options.backoff.jitter,
          }
        : undefined,
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

    // This ensures only one waiting job can be queued for a specific option.id
    if (options?.id && !options?.allowDuplicatedPrefixes) {
      const waitingJobs = await this.queueMap[queueName].getJobs(['waiting']);

      const isJobAlreadyWaiting = waitingJobs.some(
        (job) => job.id?.slice(0, -(V4_LENGTH + 1)) === options.id,
      );

      if (isJobAlreadyWaiting) {
        return;
      }
    }

    const queueOptions = this.buildJobsOptions({ queueName, options });

    await this.queueMap[queueName].add(jobName, data, queueOptions);

    this.recordEnqueuedJobsMetric(queueName, jobName, [data]);
  }

  async bulkAdd<T>(
    queueName: MessageQueue,
    jobName: string,
    dataItems: T[],
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    if (dataItems.length === 0) {
      return;
    }

    const queueOptions = this.buildJobsOptions({ queueName, options });

    await this.queueMap[queueName].addBulk(
      dataItems.map((data, index) => ({
        name: jobName,
        data,
        opts: {
          ...queueOptions,
          jobId: queueOptions.jobId
            ? `${queueOptions.jobId}-${index}`
            : undefined,
        },
      })),
    );

    this.recordEnqueuedJobsMetric(queueName, jobName, dataItems);
  }

  private recordEnqueuedJobsMetric<T>(
    queueName: MessageQueue,
    jobName: string,
    dataItems: T[],
  ): void {
    const enqueuedCountByWorkspaceId = new Map<string | undefined, number>();

    for (const data of dataItems) {
      const workspaceId = getWorkspaceIdFromJobData(data);

      enqueuedCountByWorkspaceId.set(
        workspaceId,
        (enqueuedCountByWorkspaceId.get(workspaceId) ?? 0) + 1,
      );
    }

    for (const [workspaceId, amount] of enqueuedCountByWorkspaceId) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.JobEnqueued,
        amount,
        attributes: {
          queue: queueName,
          job_name: jobName,
          ...(isDefined(workspaceId) && { workspace_id: workspaceId }),
        },
      });
    }
  }

  async getInFlightJobs<T extends MessageQueueJobData>(
    queueName: MessageQueue,
  ): Promise<InFlightQueueJob<T>[]> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    const jobs = await this.queueMap[queueName].getJobs([
      'active',
      'waiting',
      'waiting-children',
      'paused',
      'prioritized',
      'delayed',
    ]);

    return jobs
      .filter(isDefined)
      .map((job) => ({ id: job.id, data: job.data }));
  }
}
