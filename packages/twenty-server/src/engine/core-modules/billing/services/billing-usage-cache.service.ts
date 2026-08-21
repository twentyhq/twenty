/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { buildBillingUsageAvailableCreditsCacheKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-key.util';
import { buildBillingUsageAvailableCreditsCachePattern } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-pattern.util';
import { buildBillingUsageCounterAdjustmentKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-counter-adjustment-key.util';
import { buildBillingUsageCounterAdjustmentPattern } from 'src/engine/core-modules/billing/utils/build-billing-usage-counter-adjustment-pattern.util';
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

  // Callers must hold buildBillingCreditStateLockKey: that is what stops a
  // value computed before a grant landed from being installed after it.
  async warmAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
    periodEnd: Date | string,
    availableCredits: number,
  ): Promise<void> {
    await this.billingUsageCacheStorage.set(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      availableCredits,
      msUntil(periodEnd),
    );
  }

  async hasCounterAdjustmentBeenApplied(
    workspaceId: string,
    adjustmentKey: string,
  ): Promise<boolean> {
    const marker = await this.billingUsageCacheStorage.get<boolean>(
      buildBillingUsageCounterAdjustmentKey(workspaceId, adjustmentKey),
    );

    return marker === true;
  }

  async markCounterAdjustmentApplied(
    workspaceId: string,
    adjustmentKey: string,
    periodEnd: Date | string,
  ): Promise<void> {
    await this.billingUsageCacheStorage.set(
      buildBillingUsageCounterAdjustmentKey(workspaceId, adjustmentKey),
      true,
      msUntil(periodEnd),
    );
  }

  // Signed: usage moves it down, a grant moves it up.
  async adjustAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
    deltaCredits: number,
  ): Promise<number> {
    return this.billingUsageCacheStorage.incrBy(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      deltaCredits,
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

  async flushCounterAdjustmentMarkers(workspaceId: string): Promise<void> {
    await this.billingUsageCacheStorage.flushByPattern(
      buildBillingUsageCounterAdjustmentPattern(workspaceId),
    );
  }
}

const msUntil = (date: Date | string): number =>
  Math.max(new Date(date).getTime() - Date.now(), 0);
