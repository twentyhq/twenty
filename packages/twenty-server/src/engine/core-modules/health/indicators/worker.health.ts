import { Injectable, Logger } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { type WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
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
      pointsNeeded?: number;
    },
  ): Promise<WorkerQueueHealth | null> {
    const redis = this.redisClient.getQueueClient();
    const queue = new Queue(queueName, { connection: redis });

    try {
      const workers = await queue.getWorkers();

      if (workers.length > 0) {
        const metricsParams = options?.pointsNeeded
          ? [0, options.pointsNeeded - 1]
          : [];

        const [
          failedMetrics,
          completedMetrics,
          waitingCount,
          activeCount,
          delayedCount,
        ] = await Promise.all([
          queue.getMetrics('failed', ...metricsParams),
          queue.getMetrics('completed', ...metricsParams),
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getDelayedCount(),
        ]);

        const failedCount = options?.pointsNeeded
          ? this.calculateMetricsSum(failedMetrics.data)
          : failedMetrics.count;

        const completedCount = options?.pointsNeeded
          ? this.calculateMetricsSum(completedMetrics.data)
          : completedMetrics.count;

        const totalJobs = failedCount + completedCount;
        const failureRate =
          totalJobs > 0
            ? Number(((failedCount / totalJobs) * 100).toFixed(1))
            : 0;

        return {
          queueName,
          workers: workers.length,
          status: failureRate > METRICS_FAILURE_RATE_THRESHOLD ? 'down' : 'up',
          metrics: {
            failed: failedCount,
            completed: completedCount,
            waiting: waitingCount,
            active: activeCount,
            delayed: delayedCount,
            failureRate,
            ...(options?.pointsNeeded && {
              failedData: failedMetrics.data.map(Number),
              completedData: completedMetrics.data.map(Number),
            }),
          },
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error getting queue details for ${queueName}: ${error.message}`,
      );
      throw error;
    } finally {
      await queue.close();
    }
  }

  private calculateMetricsSum(data: string[] | number[]): number {
    const sum = data.reduce((sum: number, value: string | number) => {
      const numericValue = Number(value);

      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    return Math.round(Number(sum));
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
