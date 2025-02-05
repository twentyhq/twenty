import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { HEALTH_CACHE_TTL } from 'src/engine/core-modules/health/constants/health-cache-ttl.constant';
import { TIME_WINDOW_MINUTES } from 'src/engine/core-modules/health/constants/time-window.constant';
import { HealthCounterCacheKeys } from 'src/engine/core-modules/health/types/health-counter-cache-keys.type';
import { MessageChannelSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/health-metrics.types';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class HealthCacheService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  private getKeyWithTimestamp(key: string, timestamp?: number): string {
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
    const key = this.getKeyWithTimestamp(
      HealthCounterCacheKeys.MessageChannelSyncJobByStatus,
    );

    const currentCounter =
      await this.cacheStorage.get<MessageChannelSyncJobByStatusCounter>(key);

    const updatedCounter = {
      ...currentCounter,
      [status]: (currentCounter?.[status] || 0) + increment,
    };

    await this.cacheStorage.set(key, updatedCounter, HEALTH_CACHE_TTL);
  }

  async getMessageChannelSyncJobByStatusCounter() {
    const cacheKeys = this.getLastXMinutesTimestamps(TIME_WINDOW_MINUTES).map(
      (timestamp) =>
        this.getKeyWithTimestamp(
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
}
