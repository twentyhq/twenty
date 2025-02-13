import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/heath-service-status.enum';
import { HealthCounterCacheKeys } from 'src/engine/core-modules/health/types/health-counter-cache-keys.type';
import { MessageChannelSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/health-metrics.types';
import { HealthService } from 'src/engine/core-modules/health/types/health-service.types';
import { HealthSystem } from 'src/engine/core-modules/health/types/health-system.types';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class HealthCacheService {
  private readonly healthMonitoringTimeWindowInMinutes: number;
  private readonly healthCacheTtl: number;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
    private readonly environmentService: EnvironmentService,
    private readonly redisClient: RedisClientService,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {
    this.healthMonitoringTimeWindowInMinutes = this.environmentService.get(
      'HEALTH_MONITORING_TIME_WINDOW_IN_MINUTES',
    );
    this.healthCacheTtl = this.healthMonitoringTimeWindowInMinutes * 60000 * 2;
  }

  private getCacheKeyWithTimestamp(key: string, timestamp?: number): string {
    const minuteTimestamp = timestamp ?? Math.floor(Date.now() / 60000) * 60000;

    return `${key}:${minuteTimestamp}`;
  }

  private getLastXMinutesTimestamps(minutes: number): number[] {
    const currentMinuteTimestamp = Math.floor(Date.now() / 60000) * 60000;

    return Array.from(
      { length: minutes },
      (_, i) => currentMinuteTimestamp - i * 60000,
    );
  }

  async incrementMessageChannelSyncJobByStatusCounter(
    status: MessageChannelSyncStatus,
    increment: number,
  ) {
    const cacheKey = this.getCacheKeyWithTimestamp(
      HealthCounterCacheKeys.MessageChannelSyncJobByStatus,
    );

    const currentCounter =
      await this.cacheStorage.get<MessageChannelSyncJobByStatusCounter>(
        cacheKey,
      );

    const updatedCounter = {
      ...(currentCounter || {}),
      [status]: (currentCounter?.[status] || 0) + increment,
    };

    return await this.cacheStorage.set(
      cacheKey,
      updatedCounter,
      this.healthCacheTtl,
    );
  }

  async getMessageChannelSyncJobByStatusCounter() {
    const cacheKeys = this.getLastXMinutesTimestamps(
      this.healthMonitoringTimeWindowInMinutes,
    ).map((timestamp) =>
      this.getCacheKeyWithTimestamp(
        HealthCounterCacheKeys.MessageChannelSyncJobByStatus,
        timestamp,
      ),
    );

    const aggregatedCounter = Object.fromEntries(
      Object.values(MessageChannelSyncStatus).map((status) => [status, 0]),
    );

    for (const key of cacheKeys) {
      const counter =
        await this.cacheStorage.get<MessageChannelSyncJobByStatusCounter>(key);

      if (!counter) continue;

      for (const [status, count] of Object.entries(counter) as [
        MessageChannelSyncStatus,
        number,
      ][]) {
        aggregatedCounter[status] += count;
      }
    }

    return aggregatedCounter;
  }

  async incrementInvalidCaptchaCounter() {
    const cacheKey = this.getCacheKeyWithTimestamp(
      HealthCounterCacheKeys.InvalidCaptcha,
    );

    const currentCounter = await this.cacheStorage.get<number>(cacheKey);
    const updatedCounter = (currentCounter || 0) + 1;

    return await this.cacheStorage.set(
      cacheKey,
      updatedCounter,
      this.healthCacheTtl,
    );
  }

  async getInvalidCaptchaCounter() {
    const cacheKeys = this.getLastXMinutesTimestamps(
      this.healthMonitoringTimeWindowInMinutes,
    ).map((timestamp) =>
      this.getCacheKeyWithTimestamp(
        HealthCounterCacheKeys.InvalidCaptcha,
        timestamp,
      ),
    );

    let aggregatedCounter = 0;

    for (const key of cacheKeys) {
      const counter = await this.cacheStorage.get<number>(key);

      aggregatedCounter += counter || 0;
    }

    return aggregatedCounter;
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
      // TODO: Consider getting queue names dynamically from Redis using:
      // const queueKeys = await redis.keys('bull:*:meta');
      // const queueNames = queueKeys.map(key => key.split(':')[1]);
      // This would automatically detect all queues instead of relying on MessageQueue enum
      const queues = Object.values(MessageQueue);

      const workerStatuses = await Promise.all(
        queues.map(async (queueName) => {
          const queue = new Queue(queueName, { connection: redis });
          const workers = await queue.getWorkers();

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
