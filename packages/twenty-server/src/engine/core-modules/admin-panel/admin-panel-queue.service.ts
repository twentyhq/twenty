import { Injectable, Logger } from '@nestjs/common';

import { Job, Queue } from 'bullmq';

import { JobState } from 'src/engine/core-modules/admin-panel/enums/job-state.enum';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { QUEUE_RETENTION_SECONDS } from 'src/engine/core-modules/message-queue/utils/queue-retention.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class AdminPanelQueueService {
  private readonly logger = new Logger(AdminPanelQueueService.name);

  constructor(private readonly redisClient: RedisClientService) {}

  async getQueueJobs(
    queueName: MessageQueue,
    state?: JobState,
    limit = 50,
    offset = 0,
  ) {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const validLimit = Math.min(Math.max(1, limit), 200);
      const validOffset = Math.max(0, offset);

      const start = validOffset;
      const end = validOffset + validLimit - 1;

      const stateToFetch = state || JobState.completed;

      const jobs = await queue.getJobs(
        [stateToFetch] as (
          | 'completed'
          | 'failed'
          | 'active'
          | 'waiting'
          | 'delayed'
          | 'paused'
        )[],
        start,
        end,
        false,
      );

      const transformedJobs = await Promise.all(
        jobs.map(async (job) => {
          const logs = await this.getJobLogs(job);

          return {
            id: job.id!,
            name: job.name,
            data: job.data,
            state: this.getJobState(job),
            timestamp: job.timestamp,
            failedReason: job.failedReason,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            attemptsMade: job.attemptsMade,
            returnValue: job.returnvalue,
            logs,
            stacktrace: job.stacktrace,
          };
        }),
      );

      const hasMore = jobs.length === validLimit;

      // Compute total count for the selected state
      const jobCounts = await queue.getJobCounts(
        'completed',
        'failed',
        'active',
        'waiting',
        'delayed',
        'paused',
      );

      const totalCountForState = (() => {
        switch (stateToFetch) {
          case 'completed':
            return jobCounts.completed ?? 0;
          case 'failed':
            return jobCounts.failed ?? 0;
          case 'active':
            return jobCounts.active ?? 0;
          case 'waiting':
            return jobCounts.waiting ?? 0;
          case 'delayed':
            return jobCounts.delayed ?? 0;
          case 'paused':
            return jobCounts.paused ?? 0;
          default:
            return jobs.length;
        }
      })();

      return {
        jobs: transformedJobs,
        count: jobs.length,
        totalCount: totalCountForState,
        hasMore,
        retentionConfig: { ...QUEUE_RETENTION_SECONDS },
      };
    } catch (error) {
      this.logger.error(
        `Error getting jobs for queue ${queueName}: ${error.message}`,
      );
      throw error;
    } finally {
      await queue.close();
    }
  }

  async retryJobs(queueName: MessageQueue, jobIds: string[]): Promise<number> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      let retriedCount = 0;

      if (jobIds.length === 0) {
        this.logger.log(`Retrying all failed jobs in queue ${queueName}`);
        await queue.retryJobs({ state: 'failed' });

        return -1;
      }

      for (const jobId of jobIds) {
        try {
          const job = await queue.getJob(jobId);

          if (job) {
            const state = await job.getState();

            if (state === 'failed') {
              await job.retry();
              retriedCount++;
            } else {
              this.logger.warn(
                `Job ${jobId} in queue ${queueName} is not in failed state, skipping`,
              );
            }
          } else {
            this.logger.warn(
              `Job ${jobId} not found in queue ${queueName}, skipping`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error retrying job ${jobId} in queue ${queueName}: ${error.message}`,
          );
        }
      }

      return retriedCount;
    } catch (error) {
      this.logger.error(
        `Error retrying jobs in queue ${queueName}: ${error.message}`,
      );
      throw error;
    } finally {
      await queue.close();
    }
  }

  async deleteJobs(queueName: MessageQueue, jobIds: string[]): Promise<number> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      let deletedCount = 0;

      for (const jobId of jobIds) {
        try {
          const job = await queue.getJob(jobId);

          if (job) {
            await job.remove();
            deletedCount++;
          } else {
            this.logger.warn(
              `Job ${jobId} not found in queue ${queueName}, skipping`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error deleting job ${jobId} in queue ${queueName}: ${error.message}`,
          );
        }
      }

      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Error deleting jobs in queue ${queueName}: ${error.message}`,
      );
      throw error;
    } finally {
      await queue.close();
    }
  }

  private async getJobLogs(_job: Job): Promise<string[] | undefined> {
    return undefined;
  }

  private getJobState(job: Job): JobState {
    if (job.finishedOn) {
      return job.failedReason ? JobState.failed : JobState.completed;
    }
    if (job.processedOn) {
      return JobState.active;
    }
    if (job.delay) {
      return JobState.delayed;
    }

    return JobState.waiting;
  }
}
