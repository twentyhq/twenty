import {
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { type EventEmitter2 } from '@nestjs/event-emitter';
import * as Sentry from '@sentry/node';
import {
  type Job,
  type JobsOptions,
  type JobType,
  MetricsTime,
  Queue,
  type QueueOptions,
  UnrecoverableError,
  Worker,
} from 'bullmq';
import { type JobState as BullMQJobState } from 'bullmq/dist/esm/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  type QueueCronJobOptions,
  type QueueJobLimiter,
  type QueueJobOptions,
  type QueueJobRecipient,
  type QueueJobScope,
  type QueueJobSettings,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import {
  type BulkAddResult,
  type InFlightQueueJob,
  type MessageQueueDriver,
  type QueueJobDetails,
  type QueueJobToAdd,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import {
  type MessageQueueJob,
  type MessageQueueJobData,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { DEFAULT_JOB_PRIORITY } from 'src/engine/core-modules/message-queue/constants/default-job-priority.constant';
import { QUEUE_JOB_CHANGED_EVENT } from 'src/engine/core-modules/message-queue/constants/queue-job-changed-event.constant';
import { QUEUE_RETENTION } from 'src/engine/core-modules/message-queue/constants/queue-retention.constants';
import { FairQueueScheduler } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-queue-scheduler';
import {
  getChargedGroupKeys,
  type JobMemoryReconciliation,
  JobMemoryLimiter,
} from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limiter';
import { JobSizeLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-size-limiter';
import { JOBS_EXIST_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/jobs-exist-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type QueueJobChangedEvent } from 'src/engine/core-modules/message-queue/types/queue-job-changed-event.type';
import { getJobKey } from 'src/engine/core-modules/message-queue/utils/get-job-key.util';
import { buildQueueJobIdWithSuffix } from 'src/engine/core-modules/message-queue/utils/build-queue-job-id-with-suffix.util';
import { buildQueueJobGroupKeys } from 'src/engine/core-modules/message-queue/utils/build-queue-job-group-keys.util';
import { computeJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-size-bytes.util';
import { runRedisScript } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { buildJobLogContext } from 'src/engine/core-modules/message-queue/utils/build-job-log-context.util';
import { computeJobQueueWaitMs } from 'src/engine/core-modules/message-queue/utils/compute-job-queue-wait-ms.util';
import { isQueueJobIdAlreadyWaiting } from 'src/engine/core-modules/message-queue/utils/is-queue-job-id-already-waiting.util';
import { JOB_LATENCY_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/job-latency-ms-bucket-boundaries.constant';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import {
  buildGroupKeyMemoryObservations,
  type GroupKeyMemoryObservation,
} from 'src/engine/core-modules/message-queue/utils/build-group-key-memory-observations.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { applyWorkspaceSentryContextFromJobData } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-context-from-job-data.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type BullMQDriverOptions = QueueOptions;

type BullMQJobsOptions = JobsOptions & {
  broadcastTo?: QueueJobRecipient;
  fairBase?: number;
  memoryGroupKeys?: string[];
  memorySizeBytes?: number;
};

type PreparedJob = { options: BullMQJobsOptions; sizeBytes: number };

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
  private workersDrain: Promise<void> | undefined;
  private readonly fairQueueScheduler: FairQueueScheduler;
  private readonly jobSizeLimiter: JobSizeLimiter;
  private readonly jobMemoryLimiter: JobMemoryLimiter;
  private reportedMemoryGroupKeys = new Set<string>();

  constructor(
    private options: BullMQDriverOptions,
    private metricsService: MetricsService,
    private twentyConfigService: TwentyConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.fairQueueScheduler = new FairQueueScheduler({
      getClient: (queueName) => this.queueMap[queueName].client,
      getJobKey: ({ queueName, jobId }) =>
        this.queueMap[queueName].toKey(jobId),
      keyPrefix: options.prefix ?? 'bull',
      metricsService,
      isGroupLimiterEnabled: () =>
        twentyConfigService.get('IS_WORKER_GROUP_LIMITER_ENABLED'),
    });
    this.jobSizeLimiter = new JobSizeLimiter(
      metricsService,
      twentyConfigService,
    );
    this.jobMemoryLimiter = new JobMemoryLimiter({
      getClient: (queueName) => this.queueMap[queueName].client,
      getJobKey: ({ queueName, jobId }) =>
        this.queueMap[queueName].toKey(jobId),
      keyPrefix: options.prefix ?? 'bull',
      metricsService,
      twentyConfigService,
    });
  }

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_jobs_waiting_total',
      options: {
        description:
          'Current number of jobs waiting in queue, scheduled (delayed) jobs excluded',
      },
      callback: () =>
        this.collectJobCountsByQueue([
          'waiting',
          'prioritized',
          'paused',
          'waiting-children',
        ]),
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_jobs_delayed_total',
      options: {
        description:
          'Current number of jobs waiting for their scheduled time (delay or retry backoff)',
      },
      callback: () => this.collectJobCountsByQueue(['delayed']),
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_memory_used_ratio',
      options: {
        description:
          'Redis memory used over the capacity given to job queues (maxmemory minus the reserve)',
      },
      callback: () => this.collectQueueMemoryUsedRatio(),
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_queue_memory_group_used_bytes',
      options: {
        description:
          'Redis memory charged to the job-queue group keys (workspaces, applications) using the most',
        unit: 'By',
      },
      callback: () => this.collectTopGroupKeyMemoryUsages(),
    });
  }

  // charges of every queue share one Redis, so any registered queue's client can reconcile them all
  async reconcileJobMemory(): Promise<JobMemoryReconciliation> {
    const [queueName] = Object.keys(this.queueMap) as MessageQueue[];

    if (!isDefined(queueName)) {
      return { releasedCount: 0, releasedBytes: 0 };
    }

    return this.jobMemoryLimiter.reconcile(queueName);
  }

  private async collectQueueMemoryUsedRatio(): Promise<
    Array<{ value: number; attributes: Record<string, string> }>
  > {
    const [queueName] = Object.keys(this.queueMap) as MessageQueue[];

    if (!isDefined(queueName)) {
      return [];
    }

    const usedRatio = await this.jobMemoryLimiter.getUsedRatio(queueName);

    return isDefined(usedRatio) ? [{ value: usedRatio, attributes: {} }] : [];
  }

  private async collectTopGroupKeyMemoryUsages(): Promise<
    GroupKeyMemoryObservation[]
  > {
    const [queueName] = Object.keys(this.queueMap) as MessageQueue[];

    if (!isDefined(queueName)) {
      return [];
    }

    const usages =
      await this.jobMemoryLimiter.getTopGroupKeyMemoryUsages(queueName);
    const observations = buildGroupKeyMemoryObservations({
      usages,
      previouslyReportedGroupKeys: this.reportedMemoryGroupKeys,
    });

    this.reportedMemoryGroupKeys = new Set(
      usages.map(({ groupKey }) => groupKey),
    );

    return observations;
  }

  private async collectJobCountsByQueue(
    jobTypes: JobType[],
  ): Promise<Array<{ value: number; attributes: { queue: string } }>> {
    const observations: Array<{
      value: number;
      attributes: { queue: string };
    }> = [];

    for (const [queueName, queue] of Object.entries(this.queueMap)) {
      try {
        observations.push({
          value: await queue.getJobCountByTypes(...jobTypes),
          attributes: { queue: queueName },
        });
      } catch (error) {
        this.logger.error(
          `Failed to collect ${jobTypes.join('/')} jobs metrics for queue ${queueName}`,
          error,
        );
      }
    }

    return observations;
  }

  register(queueName: MessageQueue): void {
    this.queueMap[queueName] = new Queue(queueName, this.options);
  }

  async onModuleDestroy() {
    const queues = Object.values(this.queueMap);

    let workerCloseError: unknown;

    try {
      await this.closeWorkers();
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

  closeWorkers(): Promise<void> {
    this.workersDrain ??= this.drainWorkers();

    return this.workersDrain;
  }

  private async drainWorkers(): Promise<void> {
    const workers = Object.entries(this.workerMap) as [MessageQueue, Worker][];

    if (workers.length > 0) {
      this.logger.log(
        `Draining active jobs on queues: ${workers.map(([queueName]) => queueName).join(', ')}`,
      );
    }

    const closeResults = await Promise.allSettled(
      workers.map(([queueName, worker]) => this.closeWorker(queueName, worker)),
    );

    const failedClose = closeResults.find(
      (closeResult): closeResult is PromiseRejectedResult =>
        closeResult.status === 'rejected',
    );

    if (isDefined(failedClose)) {
      throw failedClose.reason;
    }
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

  private async writeGlobalConcurrency(
    queueName: MessageQueue,
    globalConcurrency: number | undefined,
  ): Promise<void> {
    const queue = this.queueMap[queueName];

    if (isDefined(globalConcurrency)) {
      await queue.setGlobalConcurrency(globalConcurrency);

      return;
    }

    await queue.removeGlobalConcurrency();
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
      ...(isDefined(options?.rateLimit)
        ? {
            limiter: {
              max: options.rateLimit.max,
              duration: options.rateLimit.durationMs,
            },
          }
        : {}),
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK,
        collectInterval: 60000,
      },
    };

    this.workerOptionsMap[queueName] = options;

    void this.writeGlobalConcurrency(queueName, options?.globalConcurrency);

    this.workerMap[queueName] = new Worker(
      queueName,
      async (job, _token, abortSignal) =>
        Sentry.withIsolationScope(async () => {
          applyWorkspaceSentryContextFromJobData(job.data);

          if (isDefined(job.id)) {
            this.fairQueueScheduler.onJobStarted({ queueName, jobId: job.id });
          }

          const queueWaitMs = computeJobQueueWaitMs({ job, now: Date.now() });

          if (isDefined(queueWaitMs)) {
            this.metricsService.recordHistogram({
              key: MetricsKeys.JobLatencyMs,
              value: queueWaitMs,
              unit: 'ms',
              attributes: { queue: queueName, job_name: job.name },
              bucketBoundaries: JOB_LATENCY_MS_BUCKET_BOUNDARIES,
            });
          }

          // TODO: Correctly support for job.id
          const timeStart = performance.now();
          const logContext = buildJobLogContext({
            jobData: job.data,
            queueWaitMs,
          });

          this.logger.log(
            `Processing job ${job.id} with name ${job.name} on queue ${queueName}${logContext}`,
          );

          try {
            await handler({
              data: job.data,
              id: job.id ?? '',
              name: job.name,
              retryLimit: Math.max(0, (job.opts.attempts ?? 1) - 1),
              updateData: (data) => job.updateData(data),
              updateProgress: (progress) => job.updateProgress(progress),
              abortSignal,
            });
          } catch (error) {
            if (
              error instanceof MessageQueueException &&
              error.code === MessageQueueExceptionCode.JOB_TOO_LARGE
            ) {
              throw new UnrecoverableError(error.message);
            }

            throw error;
          } finally {
            this.metricsService.recordHistogram({
              key: MetricsKeys.JobDurationMs,
              value: performance.now() - timeStart,
              unit: 'ms',
              attributes: { queue: queueName, job_name: job.name },
              bucketBoundaries: JOB_LATENCY_MS_BUCKET_BOUNDARIES,
            });
          }

          const executionTime = performance.now() - timeStart;

          this.logger.log(
            `Job ${job.id} with name ${job.name} processed on queue ${queueName} in ${executionTime.toFixed(2)}ms${logContext}`,
          );
        }),
      workerOptions,
    );

    this.workerMap[queueName].on('active', (job) =>
      this.emitJobChange({ queueName, job, state: 'active' }),
    );
    this.workerMap[queueName].on('progress', (job) =>
      this.emitJobChange({ queueName, job, state: 'active' }),
    );
    this.workerMap[queueName].on('completed', (job) =>
      this.emitJobChange({ queueName, job, state: 'completed' }),
    );
    this.workerMap[queueName].on('failed', (job) =>
      this.emitJobChange({ queueName, job, state: 'failed' }),
    );

    this.workerMap[queueName].on('completed', (job) =>
      this.releaseFinishedJobMemory({ queueName, job }),
    );
    this.workerMap[queueName].on('failed', (job) => {
      if (isDefined(job?.finishedOn)) {
        this.releaseFinishedJobMemory({ queueName, job });
      }
    });

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

  private emitJobChange({
    queueName,
    job,
    state,
  }: {
    queueName: MessageQueue;
    job: Job | undefined;
    state: BullMQJobState;
  }): void {
    if (!isDefined(job) || !isDefined(this.getBroadcastTo(job))) {
      return;
    }

    const jobDetails = this.buildQueueJobDetails({ job, state });

    if (!isDefined(jobDetails)) {
      return;
    }

    this.eventEmitter.emit(QUEUE_JOB_CHANGED_EVENT, {
      queueName,
      job: jobDetails,
    } satisfies QueueJobChangedEvent);
  }

  private getBroadcastTo(job: Job): QueueJobRecipient | undefined {
    const { broadcastTo }: BullMQJobsOptions = job.opts;

    return broadcastTo;
  }

  private buildJobsOptions(options?: QueueJobSettings): BullMQJobsOptions {
    return {
      jobId: options?.id
        ? buildQueueJobIdWithSuffix({ jobIdPrefix: options.id, suffix: v4() })
        : undefined,
      priority: options?.priority ?? DEFAULT_JOB_PRIORITY,
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
      deduplication: options?.deduplication,
      broadcastTo: options?.broadcastTo,
    };
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options: QueueJobOptions,
  ): Promise<string | undefined> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    if (options.id && !options.doNotCheckDuplicatesBasedOnPrefix) {
      const waitingJobIds = await this.getWaitingJobIds({
        queueName,
        includeDelayed: this.isPacedJob(options.limiter),
      });

      if (
        isQueueJobIdAlreadyWaiting({ waitingJobIds, jobIdOrPrefix: options.id })
      ) {
        return;
      }
    }

    const queueOptions = this.buildJobsOptions(options);
    const {
      preparedJobs: [preparedJob],
    } = await this.prepareJobs({
      queueName,
      jobName,
      jobs: [{ index: 0, data, options: queueOptions, scope: options }],
      additionalGroupKeys: options.groupKeys,
    });

    const [jobOptions] = await this.fairQueueScheduler.computeJobOptions({
      queueName,
      scopes: [options],
      limiters: [options.limiter],
      additionalGroupKeys: options.groupKeys,
      delay: options.delay,
      staticPriority: queueOptions.priority,
    });

    const [job] = await this.addPreparedJobs({
      queueName,
      preparedJobs: [preparedJob],
      addJobs: async () => [
        await this.queueMap[queueName].add(jobName, data, {
          ...preparedJob.options,
          ...jobOptions,
        }),
      ],
    });

    return job.id;
  }

  private async prepareJobs({
    queueName,
    jobName,
    jobs,
    additionalGroupKeys,
    shouldReportSizes = false,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobs: {
      index: number;
      data: unknown;
      options: BullMQJobsOptions;
      scope: QueueJobScope;
    }[];
    additionalGroupKeys?: string[];
    shouldReportSizes?: boolean;
  }): Promise<{ preparedJobs: PreparedJob[]; availableBytes: number | null }> {
    const isLimitingEnabled = this.jobMemoryLimiter.isEnabled();
    const sizedJobs = jobs.map(({ index, data, options, scope }) => ({
      index,
      groupKeys: buildQueueJobGroupKeys({ scope, additionalGroupKeys }),
      sizeBytes:
        isLimitingEnabled || shouldReportSizes
          ? computeJobSizeBytes({ data, options })
          : 0,
      options: {
        ...options,
        jobId: options.jobId ?? (isLimitingEnabled ? v4() : undefined),
      },
    }));

    this.jobSizeLimiter.checkJobSizesOrThrow({
      queueName,
      jobName,
      jobs: sizedJobs.map(({ index, groupKeys, sizeBytes }) => ({
        index,
        groupKey: groupKeys[0],
        sizeBytes,
      })),
    });

    const existingJobIds = isLimitingEnabled
      ? await this.findExistingJobIds({
          queueName,
          jobIds: jobs.flatMap(({ options }) =>
            isDefined(options.jobId) ? [options.jobId] : [],
          ),
        })
      : new Set<string>();
    const chargeableJobs = sizedJobs.filter(
      ({ options }) =>
        isDefined(options.jobId) && !existingJobIds.has(options.jobId),
    );

    const { isCharged, availableBytes } = await this.jobMemoryLimiter.admit({
      queueName,
      jobName,
      jobs: chargeableJobs.flatMap(({ options, sizeBytes, groupKeys }) =>
        isDefined(options.jobId)
          ? [{ jobId: options.jobId, sizeBytes, groupKeys }]
          : [],
      ),
    });

    const preparedJobs = sizedJobs.map((sizedJob) => {
      const { options, sizeBytes, groupKeys } = sizedJob;
      const memoryGroupKeys = getChargedGroupKeys(groupKeys);

      const isJobCharged =
        isCharged &&
        chargeableJobs.includes(sizedJob) &&
        isNonEmptyArray(memoryGroupKeys);

      if (!isJobCharged) {
        return { sizeBytes, options };
      }

      return {
        sizeBytes,
        options: { ...options, memoryGroupKeys, memorySizeBytes: sizeBytes },
      };
    });

    return { preparedJobs, availableBytes };
  }

  private async findExistingJobIds({
    queueName,
    jobIds,
  }: {
    queueName: MessageQueue;
    jobIds: string[];
  }): Promise<Set<string>> {
    if (jobIds.length === 0) {
      return new Set();
    }

    const queue = this.queueMap[queueName];

    try {
      const existenceFlags = String(
        await runRedisScript({
          client: await queue.client,
          script: JOBS_EXIST_SCRIPT,
          keys: jobIds.map((jobId) => queue.toKey(jobId)),
          args: [],
        }),
      )
        .split(' ')
        .map(Number);

      return new Set(jobIds.filter((_, index) => existenceFlags[index] === 1));
    } catch (error) {
      this.logger.warn(
        `Failed to check existing jobs on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return new Set();
    }
  }

  private async addPreparedJobs({
    queueName,
    preparedJobs,
    addJobs,
  }: {
    queueName: MessageQueue;
    preparedJobs: PreparedJob[];
    addJobs: () => Promise<Job[]>;
  }): Promise<Job[]> {
    const addedJobs = await addJobs().catch(async (error: unknown) => {
      await Promise.all(
        preparedJobs.map((preparedJob) =>
          this.releaseJobMemoryIfNotAdded({ queueName, preparedJob }),
        ),
      );

      throw error;
    });

    await Promise.all(
      addedJobs.map((addedJob, index) => {
        const { jobId, memoryGroupKeys } = preparedJobs[index].options;

        if (
          !isDefined(jobId) ||
          !isNonEmptyArray(memoryGroupKeys) ||
          addedJob.id === jobId
        ) {
          return;
        }

        return this.jobMemoryLimiter.release({
          queueName,
          jobId,
          groupKeys: memoryGroupKeys,
        });
      }),
    );

    return addedJobs;
  }

  private async releaseJobMemoryIfNotAdded({
    queueName,
    preparedJob,
  }: {
    queueName: MessageQueue;
    preparedJob: PreparedJob;
  }): Promise<void> {
    const { jobId, memoryGroupKeys } = preparedJob.options;

    if (!isDefined(jobId) || !isNonEmptyArray(memoryGroupKeys)) {
      return;
    }

    try {
      if (isDefined(await this.queueMap[queueName].getJob(jobId))) {
        return;
      }
    } catch (error) {
      this.logger.warn(
        `Kept the job memory charge of job ${jobId} on queue ${queueName}: its enqueue outcome is unknown (${error instanceof Error ? error.message : String(error)})`,
      );

      return;
    }

    await this.jobMemoryLimiter.release({
      queueName,
      jobId,
      groupKeys: memoryGroupKeys,
    });
  }

  private releaseFinishedJobMemory({
    queueName,
    job,
  }: {
    queueName: MessageQueue;
    job: Job | undefined;
  }): void {
    const memoryGroupKeys = (job?.opts as BullMQJobsOptions | undefined)
      ?.memoryGroupKeys;

    if (!isDefined(job?.id) || !isNonEmptyArray(memoryGroupKeys)) {
      return;
    }

    void this.jobMemoryLimiter.release({
      queueName,
      jobId: job.id,
      groupKeys: memoryGroupKeys,
    });
  }

  // A paced job waits in the delayed set, so only paced jobs dedupe against it.
  private isPacedJob(limiter: QueueJobLimiter | undefined): boolean {
    return (
      isDefined(limiter) && this.fairQueueScheduler.isGroupLimiterEnabled()
    );
  }

  private async getWaitingJobIds({
    queueName,
    includeDelayed,
  }: {
    queueName: MessageQueue;
    includeDelayed: boolean;
  }): Promise<string[]> {
    return this.queueMap[queueName].getRanges(
      includeDelayed
        ? ['waiting', 'paused', 'prioritized', 'delayed']
        : ['waiting', 'paused', 'prioritized'],
      0,
      -1,
    );
  }

  private async filterOutAlreadyWaitingJobs<
    TJob extends QueueJobToAdd<MessageQueueJobData>,
  >({
    queueName,
    jobs,
    defaultLimiter,
  }: {
    queueName: MessageQueue;
    jobs: TJob[];
    defaultLimiter: QueueJobLimiter | undefined;
  }): Promise<TJob[]> {
    if (!jobs.some((job) => isDefined(job.jobId))) {
      return jobs;
    }

    const isPacedJobById = (job: TJob) =>
      isDefined(job.jobId) && this.isPacedJob(job.limiter ?? defaultLimiter);
    const waitingJobIds = await this.getWaitingJobIds({
      queueName,
      includeDelayed: false,
    });
    const waitingOrDelayedJobIds = jobs.some(isPacedJobById)
      ? [
          ...waitingJobIds,
          ...(await this.queueMap[queueName].getRanges(['delayed'], 0, -1)),
        ]
      : waitingJobIds;

    return jobs.filter(
      (job) =>
        !isDefined(job.jobId) ||
        !isQueueJobIdAlreadyWaiting({
          waitingJobIds: isPacedJobById(job)
            ? waitingOrDelayedJobIds
            : waitingJobIds,
          jobIdOrPrefix: job.jobId,
        }),
    );
  }

  async bulkAdd<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobName: string,
    jobs: QueueJobToAdd<T>[],
    options?: QueueJobSettings,
  ): Promise<BulkAddResult> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    const indexedJobs = jobs.map((job, inputIndex) => ({ ...job, inputIndex }));
    const jobsToAdd = options?.doNotCheckDuplicatesBasedOnPrefix
      ? indexedJobs
      : await this.filterOutAlreadyWaitingJobs({
          queueName,
          jobs: indexedJobs,
          defaultLimiter: options?.limiter,
        });

    if (jobsToAdd.length === 0) {
      return { jobs: [], availableBytes: null };
    }

    const queueOptions = this.buildJobsOptions(options);
    const { preparedJobs, availableBytes } = await this.prepareJobs({
      queueName,
      jobName,
      jobs: jobsToAdd.map((job, index) => ({
        index: job.inputIndex,
        data: job.data,
        options: {
          ...queueOptions,
          jobId:
            job.jobId ??
            (isDefined(queueOptions.jobId)
              ? `${queueOptions.jobId}-${index}`
              : undefined),
        },
        scope: job,
      })),
      additionalGroupKeys: options?.groupKeys,
      shouldReportSizes: true,
    });

    // BullMQ ignores a re-added job id, so it must not take a pacing slot.
    const existingPacedJobIds = this.fairQueueScheduler.isGroupLimiterEnabled()
      ? await this.findExistingJobIds({
          queueName,
          jobIds: jobsToAdd.flatMap((job) =>
            isDefined(job.jobId) && isDefined(job.limiter ?? options?.limiter)
              ? [job.jobId]
              : [],
          ),
        })
      : new Set<string>();

    const jobOptions = await this.fairQueueScheduler.computeJobOptions({
      queueName,
      scopes: jobsToAdd,
      limiters: jobsToAdd.map((job) =>
        isDefined(job.jobId) && existingPacedJobIds.has(job.jobId)
          ? undefined
          : (job.limiter ?? options?.limiter),
      ),
      additionalGroupKeys: options?.groupKeys,
      delay: options?.delay,
      staticPriority: queueOptions.priority,
    });

    const addedJobs = await this.addPreparedJobs({
      queueName,
      preparedJobs,
      addJobs: () =>
        this.queueMap[queueName].addBulk(
          jobsToAdd.map(({ data }, index) => ({
            name: jobName,
            data,
            opts: {
              ...preparedJobs[index].options,
              ...jobOptions[index],
            },
          })),
        ),
    });

    return {
      jobs: addedJobs.flatMap((addedJob, index) =>
        isDefined(addedJob.id)
          ? [{ jobId: addedJob.id, sizeBytes: preparedJobs[index].sizeBytes }]
          : [],
      ),
      availableBytes,
    };
  }

  async getJobs<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<Partial<Record<string, QueueJobDetails<T>>>> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    const jobs = await Promise.all(
      jobIds.map((jobId) => this.getJobDetails<T>(queueName, jobId)),
    );

    return Object.fromEntries(
      jobs.filter(isDefined).map((job) => [job.id, job]),
    );
  }

  private async getJobDetails<T extends MessageQueueJobData>(
    queueName: MessageQueue,
    jobId: string,
  ): Promise<QueueJobDetails<T> | undefined> {
    const job = await this.queueMap[queueName].getJob(jobId);

    if (!isDefined(job)) {
      return undefined;
    }

    const state = await job.getState();

    // BullMQ reports 'unknown' for a job whose record was evicted by retention
    if (state === 'unknown') {
      return undefined;
    }

    return this.buildQueueJobDetails<T>({ job, state });
  }

  private buildQueueJobDetails<T extends MessageQueueJobData>({
    job,
    state,
  }: {
    job: Job;
    state: BullMQJobState;
  }): QueueJobDetails<T> | undefined {
    if (!isDefined(job.id)) {
      return undefined;
    }

    return {
      id: job.id,
      data: job.data,
      state,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      progress: job.progress,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      broadcastTo: this.getBroadcastTo(job),
    };
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
