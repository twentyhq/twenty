import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { Queue } from 'bullmq';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health,type';
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
      const workerStatus = await withHealthCheckTimeout(
        this.checkWorkers(),
        HEALTH_ERROR_MESSAGES.WORKER_TIMEOUT,
      );

      return this.getStatus('worker', true, {
        status: workerStatus.status,
        queues: workerStatus.details,
      });
    } catch (error) {
      return this.getStatus('worker', false, {
        error: error.message,
        status: HealthServiceStatus.OUTAGE,
      });
    }
  }

  private async checkWorkers() {
    const redis = this.redisClient.getClient();
    const queues = Object.values(MessageQueue);
    const queueStatuses: WorkerQueueHealth[] = [];
    const queuesWithoutWorkers: string[] = [];

    for (const queueName of queues) {
      const queue = new Queue(queueName, { connection: redis });
      const workers = await queue.getWorkers();

      if (workers.length === 0) {
        queuesWithoutWorkers.push(queueName);
      }

      queueStatuses.push({
        name: queueName,
        workers: workers.length,
        status:
          workers.length > 0
            ? HealthServiceStatus.OPERATIONAL
            : HealthServiceStatus.OUTAGE,
      });

      await queue.close();
    }

    if (queuesWithoutWorkers.length === queues.length) {
      throw new Error(HEALTH_ERROR_MESSAGES.NO_ACTIVE_WORKERS);
    }

    return {
      status:
        queuesWithoutWorkers.length > 0
          ? HealthServiceStatus.DEGRADED
          : HealthServiceStatus.OPERATIONAL,
      details: queueStatuses,
    };
  }
}
