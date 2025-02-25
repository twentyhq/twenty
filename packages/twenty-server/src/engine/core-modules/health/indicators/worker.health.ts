import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator {
  private readonly logger = new Logger(WorkerHealthIndicator.name);

  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('worker');

    try {
      const workerStatus = await withHealthCheckTimeout(
        this.checkWorkers(),
        HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT,
      );

      if (workerStatus.status === 'up') {
        return indicator.up({
          queues: workerStatus.queues,
        });
      }

      return indicator.down(workerStatus.error);
    } catch (error) {
      const errorMessage =
        error.message === HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT
          ? HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT
          : HEALTH_ERROR_MESSAGES.WORKER_CHECK_FAILED;

      return indicator.down(errorMessage);
    }
  }

  async getQueueDetails(
    queueName: MessageQueue,
    options?: {
      timeRange?: '7D' | '1D' | '12H' | '4H';
      pointsNeeded?: number;
    },
  ): Promise<WorkerQueueHealth | null> {
    const redis = this.redisClient.getClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const workers = await queue.getWorkers();

      if (workers.length > 0) {
        const [
          failedMetrics,
          completedMetrics,
          waitingCount,
          activeCount,
          delayedCount,
        ] = await Promise.all([
          queue.getMetrics(
            'failed',
            0,
            options?.pointsNeeded ? options.pointsNeeded - 1 : undefined,
          ),
          queue.getMetrics(
            'completed',
            0,
            options?.pointsNeeded ? options.pointsNeeded - 1 : undefined,
          ),
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getDelayedCount(),
        ]);

        const totalJobs = failedMetrics.count + completedMetrics.count;
        const failureRate =
          totalJobs > 0 ? (failedMetrics.count / totalJobs) * 100 : 0;

        await queue.close();

        return {
          queueName: queueName,
          workers: workers.length,
          status:
            workers.length > 0
              ? failureRate > METRICS_FAILURE_RATE_THRESHOLD
                ? 'down'
                : 'up'
              : 'down',
          metrics: {
            failed: failedMetrics.count,
            completed: completedMetrics.count,
            waiting: waitingCount,
            active: activeCount,
            delayed: delayedCount,
            failureRate: failureRate,
          },
        };
      }

      await queue.close();

      return null;
    } catch (error) {
      this.logger.error(
        `Error getting queue details for ${queueName}: ${error.message}`,
      );
      await queue.close();
      throw error;
    }
  }

  private async checkWorkers() {
    const queues = Object.values(MessageQueue);
    const queueStatuses: WorkerQueueHealth[] = [];

    for (const queueName of queues) {
      try {
        const queueDetails = await this.getQueueDetails(queueName);

        if (queueDetails) {
          queueStatuses.push(queueDetails);
        }
      } catch (error) {
        this.logger.error(
          `Error checking worker for queue ${queueName}: ${error.message}`,
        );
      }
    }

    const hasActiveWorkers = queueStatuses.some((q) => q.workers > 0);

    return {
      status: hasActiveWorkers ? 'up' : 'down',
      error: hasActiveWorkers
        ? undefined
        : HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS,
      queues: queueStatuses,
    };
  }
}
