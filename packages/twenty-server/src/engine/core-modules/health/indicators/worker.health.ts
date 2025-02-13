import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class WorkerHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
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

      return this.getStatus(key, totalWorkers > 0, {
        totalWorkers,
        queues: workerStatuses
          .filter((s) => s.activeWorkers > 0)
          .map((s) => s.queue),
      });
    } catch (error) {
      return this.getStatus(key, false, { error: error.message });
    }
  }
}
