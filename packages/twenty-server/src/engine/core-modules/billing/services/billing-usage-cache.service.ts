/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { buildBillingUsageAvailableCreditsCacheKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-key.util';
import { buildBillingUsageAvailableCreditsCachePattern } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-pattern.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

@Injectable()
export class BillingUsageCacheService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineBillingUsage)
    private readonly billingUsageCacheStorage: CacheStorageService,
  ) {}

  async getAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
  ): Promise<number | undefined> {
    return this.billingUsageCacheStorage.get<number>(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
    );
  }

  async warmAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
    periodEnd: Date | string,
    availableCredits: number,
  ): Promise<void> {
    const ttlMs = Math.max(new Date(periodEnd).getTime() - Date.now(), 0);

    await this.billingUsageCacheStorage.set(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      availableCredits,
      ttlMs,
    );
  }

  async decrementAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
    usedCredits: number,
  ): Promise<number> {
    return this.billingUsageCacheStorage.incrBy(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      -usedCredits,
    );
  }

  async invalidateAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
  ): Promise<void> {
    await this.billingUsageCacheStorage.del(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
    );
  }

  async flushAvailableCredits(workspaceId: string): Promise<void> {
    await this.billingUsageCacheStorage.flushByPattern(
      buildBillingUsageAvailableCreditsCachePattern(workspaceId),
    );
  }
}
