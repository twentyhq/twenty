import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

import { HealthCacheService } from './health-cache.service';

import { HealthServiceStatus } from './enums/heath-service-status.enum';
import { HealthService } from './types/health-service.types';
import { HealthSystem } from './types/health-system.types';

@Controller('healthz')
export class HealthController {
  constructor(
    private redisClient: RedisClientService,
    private healthCacheService: HealthCacheService,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {}

  @Get('/message-channel-sync-job-by-status-counter')
  getMessageChannelSyncJobByStatusCounter() {
    return this.healthCacheService.getMessageChannelSyncJobByStatusCounter();
  }

  @Get('/invalid-captcha-counter')
  getInvalidCaptchaCounter() {
    return this.healthCacheService.getInvalidCaptchaCounter();
  }

  async getDatabaseStatus(): Promise<HealthService> {
    try {
      await this.dataSource.query('SELECT 1');

      return { status: HealthServiceStatus.OPERATIONAL };
    } catch {
      return { status: HealthServiceStatus.OUTAGE };
    }
  }

  async getRedisStatus(): Promise<HealthService> {
    try {
      const redis = this.redisClient.getClient();

      await redis.ping();

      return { status: HealthServiceStatus.OPERATIONAL };
    } catch {
      return { status: HealthServiceStatus.OUTAGE };
    }
  }

  async getWorkerStatus(): Promise<HealthService> {
    try {
      const redis = this.redisClient.getClient();

      // Get all queue names from our MessageQueue enum
      const queues = Object.values(MessageQueue);

      // Check each queue's worker status
      const workerStatuses = await Promise.all(
        queues.map(async (queueName) => {
          // Get workers for this queue
          const queue = new Queue(queueName, { connection: redis });
          const workers = await queue.getWorkers();

          const workerCount = workers.length;

          return {
            queue: queueName,
            activeWorkers: workerCount,
          };
        }),
      );

      const totalWorkers = workerStatuses.reduce(
        (sum, status) => sum + status.activeWorkers,
        0,
      );

      return {
        status:
          totalWorkers > 0
            ? HealthServiceStatus.OPERATIONAL
            : HealthServiceStatus.OUTAGE,
        details: {
          totalWorkers,
          queues: workerStatuses
            .filter((s) => s.activeWorkers > 0)
            .map((s) => s.queue),
        },
      };
    } catch {
      return { status: HealthServiceStatus.OUTAGE };
    }
  }

  @Get('/system-status')
  async getSystemStatus(): Promise<HealthSystem> {
    const [database, redis, worker, messageSync] = await Promise.all([
      this.getDatabaseStatus(),
      this.getRedisStatus(),
      this.getWorkerStatus(),
      this.getMessageChannelSyncJobByStatusCounter(),
    ]);

    return {
      database,
      redis,
      worker,
      messageSync,
    };
  }
}
