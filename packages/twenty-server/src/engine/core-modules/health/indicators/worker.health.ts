import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([
        this.checkWorkers(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT)),
            HEALTH_INDICATORS_TIMEOUT,
          ),
        ),
      ]);

      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { error: error.message });
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
