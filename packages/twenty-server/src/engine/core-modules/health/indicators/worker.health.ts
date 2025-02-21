import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator {
  constructor(
    private readonly redisClient: RedisClientService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy() {
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

  private async checkWorkers() {
    const redis = this.redisClient.getClient();
    const queues = Object.values(MessageQueue);
    const queueStatuses: WorkerQueueHealth[] = [];

    for (const queueName of queues) {
      const queue = new Queue(queueName, { connection: redis });

      try {
        const workers = await queue.getWorkers();

        if (workers.length > 0) {
          const [
            failedCount,
            completedCount,
            waitingCount,
            activeCount,
            delayedCount,
            prioritizedCount,
          ] = await Promise.all([
            queue.getFailedCount(),
            queue.getCompletedCount(),
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getDelayedCount(),
            queue.getPrioritizedCount(),
          ]);

          queueStatuses.push({
            queueName: queueName,
            workers: workers.length,
            metrics: {
              failed: failedCount,
              completed: completedCount,
              waiting: waitingCount,
              active: activeCount,
              delayed: delayedCount,
              prioritized: prioritizedCount,
            },
          });
        }

        await queue.close();
      } catch (error) {
        await queue.close();
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
