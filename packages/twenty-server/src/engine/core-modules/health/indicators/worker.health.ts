import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClientService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await withHealthCheckTimeout(
        this.checkWorkers(),
        HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT,
      );

      return this.getStatus('worker', true);
    } catch (error) {
      return this.getStatus('worker', false, { error: error.message });
    }
  }

  private async checkWorkers() {
    const redis = this.redisClient.getClient();
    const queues = Object.values(MessageQueue);

    const workerStatuses = await Promise.all(
      queues.map(async (queueName) => {
        const queue = new Queue(queueName, { connection: redis });
        const workers = await queue.getWorkers();

        await queue.close();

        return {
          queue: queueName,
          activeWorkers: workers.length,
        };
      }),
    );

    const totalWorkers = workerStatuses.reduce(
      (sum, status) => sum + status.activeWorkers,
      0,
    );

    if (totalWorkers === 0) {
      throw new Error(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS);
    }

    return {
      totalWorkers,
      queues: workerStatuses
        .filter((s) => s.activeWorkers > 0)
        .map((s) => s.queue),
    };
  }
}
