import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type Job, Queue } from 'bullmq';
import { type JobState as BullMQJobState } from 'bullmq/dist/esm/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  bullMQToJobStateEnum,
  JobStateEnum,
  jobStateEnumToBullMQ,
} from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { QUEUE_RETENTION } from 'src/engine/core-modules/message-queue/constants/queue-retention.constants';
import { createJobMemoryLimiters } from 'src/engine/core-modules/message-queue/drivers/memory/create-job-memory-limiters.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { computeJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-size-bytes.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type JobOperationResult = {
  jobId: string;
  success: boolean;
  error?: string;
};

@Injectable()
export class AdminPanelQueueService {
  constructor(
    private readonly redisClient: RedisClientService,
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private buildJobMemoryLimiters(queue: Queue) {
    return createJobMemoryLimiters({
      getClient: () => queue.client,
      keyPrefix: this.redisClient.getQueuePrefix(),
      metricsService: this.metricsService,
      twentyConfigService: this.twentyConfigService,
    });
  }

  private getMemoryGroupKeys(job: Job): string[] {
    const { memoryGroupKeys } = job.opts as { memoryGroupKeys?: string[] };

    return isNonEmptyArray(memoryGroupKeys) ? memoryGroupKeys : [];
  }

  // A failed job released its memory, so a retry is a new enqueue and must pass the limits again
  private async retryJob({
    queueName,
    queue,
    job,
  }: {
    queueName: MessageQueue;
    queue: Queue;
    job: Job;
  }): Promise<void> {
    const { jobSizeLimiter, jobMemoryLimiter } =
      this.buildJobMemoryLimiters(queue);
    const groupKeys = this.getMemoryGroupKeys(job);
    const sizeBytes = computeJobSizeBytes({
      data: job.data,
      options: job.opts,
    });

    jobSizeLimiter.checkJobSizes({
      queueName,
      jobs: [{ groupKey: groupKeys[0] ?? 'unknown', sizeBytes }],
    });

    if (groupKeys.length === 0 || !job.id) {
      await job.retry();

      return;
    }

    await jobMemoryLimiter.admit({
      queueName,
      jobs: [{ jobId: job.id, sizeBytes, groupKeys }],
    });

    try {
      await job.retry();
    } catch (error) {
      await jobMemoryLimiter.release({ queueName, jobId: job.id, groupKeys });

      throw error;
    }
  }

  async getQueueJobs(
    queueName: MessageQueue,
    state: JobStateEnum,
    limit = 50,
    offset = 0,
  ) {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, {
      connection: redis,
      prefix: this.redisClient.getQueuePrefix(),
    });

    try {
      const validLimit = Math.min(Math.max(1, limit), 200);
      const validOffset = Math.max(0, offset);

      const start = validOffset;
      const end = validOffset + validLimit - 1;

      const bullMQState = jobStateEnumToBullMQ[state];
      const jobs = await queue.getJobs([bullMQState], start, end, false);

      const transformedJobs = await Promise.all(
        jobs.map(async (job) => {
          const jobBullMQState = (await job.getState()) as BullMQJobState;

          return {
            id: job.id!,
            name: job.name,
            data: job.data,
            state: bullMQToJobStateEnum[jobBullMQState],
            timestamp: job.timestamp,
            failedReason: job.failedReason,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            attemptsMade: job.attemptsMade,
            returnValue: job.returnvalue,
            logs: undefined,
            stackTrace: job.stacktrace ?? undefined,
          };
        }),
      );

      const hasMore = jobs.length === validLimit;

      const jobCounts = await queue.getJobCounts(
        'completed',
        'failed',
        'active',
        'waiting',
        'delayed',
        'prioritized',
        'waiting-children',
      );

      const totalCountForState = (() => {
        switch (state) {
          case JobStateEnum.COMPLETED:
            return jobCounts.completed ?? 0;
          case JobStateEnum.FAILED:
            return jobCounts.failed ?? 0;
          case JobStateEnum.ACTIVE:
            return jobCounts.active ?? 0;
          case JobStateEnum.WAITING:
            return jobCounts.waiting ?? 0;
          case JobStateEnum.DELAYED:
            return jobCounts.delayed ?? 0;
          case JobStateEnum.PRIORITIZED:
            return jobCounts.prioritized ?? 0;
          case JobStateEnum.WAITING_CHILDREN:
            return jobCounts['waiting-children'] ?? 0;
          default:
            return jobs.length;
        }
      })();

      return {
        jobs: transformedJobs,
        count: jobs.length,
        totalCount: totalCountForState,
        hasMore,
        retentionConfig: { ...QUEUE_RETENTION },
      };
    } catch (error) {
      throw new InternalServerError(
        `Failed to fetch jobs from queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
        {
          userFriendlyMessage: msg`Failed to load queue jobs. Please try again later.`,
        },
      );
    } finally {
      await queue.close();
    }
  }

  async retryJobs(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<{
    retriedCount: number;
    results: JobOperationResult[];
  }> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, {
      connection: redis,
      prefix: this.redisClient.getQueuePrefix(),
    });

    try {
      if (jobIds.length === 0) {
        await queue.retryJobs({ state: 'failed' });

        return { retriedCount: -1, results: [] };
      }

      const results: JobOperationResult[] = [];
      let retriedCount = 0;

      for (const jobId of jobIds) {
        const job = await queue.getJob(jobId);

        if (!job) {
          results.push({
            jobId,
            success: false,
            error: 'Job not found',
          });
          continue;
        }

        const state = await job.getState();

        if (state !== 'failed') {
          results.push({
            jobId,
            success: false,
            error: `Job is not in failed state (current state: ${state})`,
          });
          continue;
        }

        try {
          await this.retryJob({ queueName, queue, job });
          retriedCount++;
          results.push({
            jobId,
            success: true,
          });
        } catch (error) {
          results.push({
            jobId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return { retriedCount, results };
    } catch (error) {
      throw new InternalServerError(
        `Failed to retry jobs in queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
        {
          userFriendlyMessage: msg`Failed to retry jobs. Please try again later.`,
        },
      );
    } finally {
      await queue.close();
    }
  }

  async deleteJobs(
    queueName: MessageQueue,
    jobIds: string[],
  ): Promise<{
    deletedCount: number;
    results: JobOperationResult[];
  }> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, {
      connection: redis,
      prefix: this.redisClient.getQueuePrefix(),
    });

    try {
      const results: JobOperationResult[] = [];
      let deletedCount = 0;

      for (const jobId of jobIds) {
        const job = await queue.getJob(jobId);

        if (!job) {
          results.push({
            jobId,
            success: false,
            error: 'Job not found',
          });
          continue;
        }

        try {
          await job.remove();

          const groupKeys = this.getMemoryGroupKeys(job);

          if (job.id && groupKeys.length > 0) {
            await this.buildJobMemoryLimiters(queue).jobMemoryLimiter.release({
              queueName,
              jobId: job.id,
              groupKeys,
            });
          }

          deletedCount++;
          results.push({
            jobId,
            success: true,
          });
        } catch (error) {
          results.push({
            jobId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return { deletedCount, results };
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete jobs in queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
        {
          userFriendlyMessage: msg`Failed to delete jobs. Please try again later.`,
        },
      );
    } finally {
      await queue.close();
    }
  }
}
