import { Logger, type OnModuleDestroy } from '@nestjs/common';

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

export type BullMQDriverOptions = QueueOptions;

const V4_LENGTH = 36;

export class BullMQDriver implements MessageQueueDriver, OnModuleDestroy {
  private logger = new Logger(BullMQDriver.name);
  private queueMap: Record<MessageQueue, Queue> = {} as Record<
    MessageQueue,
    Queue
  >;
  private workerMap: Record<MessageQueue, Worker> = {} as Record<
    MessageQueue,
    Worker
  >;

  constructor(
    private options: BullMQDriverOptions,
    private metricsService: MetricsService,
  ) {}

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
      async (job) => {
        // TODO: Correctly support for job.id
        const timeStart = performance.now();

        this.logger.log(
          `Processing job ${job.id} with name ${job.name} on queue ${queueName}`,
        );
        await handler({ data: job.data, id: job.id ?? '', name: job.name });
        const timeEnd = performance.now();
        const executionTime = timeEnd - timeStart;

        this.logger.log(
          `Job ${job.id} with name ${job.name} processed on queue ${queueName} in ${executionTime.toFixed(2)}ms`,
        );
      },
      workerOptions,
    );

    this.workerMap[queueName].on('completed', (job) => {
      this.metricsService.incrementCounter({
        key: MetricsKeys.JobCompleted,
        attributes: { queue: queueName, job_name: job?.name ?? '' },
        shouldStoreInCache: false,
      });
    });

    this.workerMap[queueName].on('failed', (job, error) => {
      if (!isDefined(job) || !isDefined(error)) {
        return;
      }

      this.metricsService.incrementCounter({
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

    // This ensures only one waiting job can be queued for a specific option.id
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
}
