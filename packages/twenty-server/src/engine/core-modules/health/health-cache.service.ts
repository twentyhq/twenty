import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { AccountSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/account-sync-metrics.types';
import { HealthCounterCacheKeys } from 'src/engine/core-modules/health/types/health-counter-cache-keys.type';
import { CalendarChannelSyncStatus } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

const CACHE_BUCKET_DURATION_MS = 15000; // 15 seconds window for each cache bucket

@Injectable()
export class HealthCacheService {
  private readonly healthMetricsTimeWindowInMinutes: number;
  private readonly healthCacheTtl: number;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
    private readonly environmentService: EnvironmentService,
  ) {
    this.healthMetricsTimeWindowInMinutes = this.environmentService.get(
      'HEALTH_METRICS_TIME_WINDOW_IN_MINUTES',
    );
    this.healthCacheTtl = this.healthMetricsTimeWindowInMinutes * 60000 * 2;
  }

  private getCacheBucketStartTimestamp(timestamp: number): number {
    return (
      Math.floor(timestamp / CACHE_BUCKET_DURATION_MS) *
      CACHE_BUCKET_DURATION_MS
    );
  }

  private getCacheKeyWithTimestamp(key: string, timestamp?: number): string {
    const currentIntervalTimestamp =
      timestamp ?? this.getCacheBucketStartTimestamp(Date.now());

    return `${key}:${currentIntervalTimestamp}`;
  }

  private getLastCacheBucketStartTimestampsFromDate(
    cacheBucketsCount: number,
    date: number = Date.now(),
  ): number[] {
    const currentIntervalTimestamp = this.getCacheBucketStartTimestamp(date);

    return Array.from(
      { length: cacheBucketsCount },
      (_, i) => currentIntervalTimestamp - i * CACHE_BUCKET_DURATION_MS,
    );
  }

  async updateMessageOrCalendarChannelSyncJobByStatusCache(
    key: HealthCounterCacheKeys,
    status: MessageChannelSyncStatus | CalendarChannelSyncStatus,
    messageChannelIds: string[],
  ) {
    return await this.cacheStorage.setAdd(
      this.getCacheKeyWithTimestamp(`${key}:${status}`),
      messageChannelIds,
      this.healthCacheTtl,
    );
  }

  async countChannelSyncJobByStatus(
    key:
      | HealthCounterCacheKeys.MessageChannelSyncJobByStatus
      | HealthCounterCacheKeys.CalendarEventSyncJobByStatus,
    timeWindowInSeconds: number = this.healthMetricsTimeWindowInMinutes * 60,
  ): Promise<AccountSyncJobByStatusCounter> {
    if ((timeWindowInSeconds * 1000) % CACHE_BUCKET_DURATION_MS !== 0) {
      throw new Error(
        `Time window must be divisible by ${CACHE_BUCKET_DURATION_MS}`,
      );
    }

    const now = Date.now();
    const countByStatus = {} as AccountSyncJobByStatusCounter;
    const statuses =
      key === HealthCounterCacheKeys.MessageChannelSyncJobByStatus
        ? Object.values(MessageChannelSyncStatus).filter(
            (status) => status !== MessageChannelSyncStatus.ONGOING,
          )
        : Object.values(CalendarChannelSyncStatus).filter(
            (status) => status !== CalendarChannelSyncStatus.ONGOING,
          );

    const cacheBuckets =
      timeWindowInSeconds / (CACHE_BUCKET_DURATION_MS / 1000);

    for (const status of statuses) {
      const cacheKeys = this.computeTimeStampedCacheKeys(
        `${key}:${status}`,
        cacheBuckets,
        now,
      );

      const channelIdsCount =
        await this.cacheStorage.countAllSetMembers(cacheKeys);

      countByStatus[status] = channelIdsCount;
    }

    return countByStatus;
  }

  computeTimeStampedCacheKeys(
    key: string,
    cacheBucketsCount: number,
    date: number = Date.now(),
  ) {
    return this.getLastCacheBucketStartTimestampsFromDate(
      cacheBucketsCount,
      date,
    ).map((timestamp) => this.getCacheKeyWithTimestamp(key, timestamp));
  }

  async updateInvalidCaptchaCache(captchaToken: string) {
    return await this.cacheStorage.setAdd(
      this.getCacheKeyWithTimestamp(HealthCounterCacheKeys.InvalidCaptcha),
      [captchaToken],
      this.healthCacheTtl,
    );
  }

  async getInvalidCaptchaCounter(
    timeWindowInSeconds: number = this.healthMetricsTimeWindowInMinutes * 60,
  ) {
    return await this.cacheStorage.countAllSetMembers(
      this.computeTimeStampedCacheKeys(
        HealthCounterCacheKeys.InvalidCaptcha,
        timeWindowInSeconds / (CACHE_BUCKET_DURATION_MS / 1000),
      ),
    );
  }
}
