/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { buildBillingUsageAvailableCreditsCacheKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-key.util';
import { buildBillingUsageAvailableCreditsCachePattern } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-pattern.util';
import {
  buildBillingUsageAvailableCreditsStaleMarkerKey,
  buildBillingUsageCounterAdjustmentKey,
} from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-stale-marker-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

// Long enough to outlive an in-flight availability computation, short enough
// that a workspace only reads through to ClickHouse briefly after a grant.
const AVAILABLE_CREDITS_STALE_MARKER_TTL_MS = 60_000;

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

  // Skips the write while a grant has the counter marked stale, so a value
  // computed before that grant landed cannot be installed for the rest of the
  // period. Returns whether the counter is now warm.
  async warmAvailableCredits(
    workspaceId: string,
    periodStart: Date | string,
    periodEnd: Date | string,
    availableCredits: number,
  ): Promise<boolean> {
    if (await this.isAvailableCreditsStale(workspaceId, periodStart)) {
      return false;
    }

    const ttlMs = Math.max(new Date(periodEnd).getTime() - Date.now(), 0);

    await this.billingUsageCacheStorage.set(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      availableCredits,
      ttlMs,
    );

    return true;
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
    const ttlMs = Math.max(new Date(periodEnd).getTime() - Date.now(), 0);

    await this.billingUsageCacheStorage.set(
      buildBillingUsageCounterAdjustmentKey(workspaceId, adjustmentKey),
      true,
      ttlMs,
    );
  }

  async markAvailableCreditsStale(
    workspaceId: string,
    periodStart: Date | string,
  ): Promise<void> {
    await this.billingUsageCacheStorage.set(
      buildBillingUsageAvailableCreditsStaleMarkerKey(workspaceId, periodStart),
      true,
      AVAILABLE_CREDITS_STALE_MARKER_TTL_MS,
    );
  }

  private async isAvailableCreditsStale(
    workspaceId: string,
    periodStart: Date | string,
  ): Promise<boolean> {
    const marker = await this.billingUsageCacheStorage.get<boolean>(
      buildBillingUsageAvailableCreditsStaleMarkerKey(workspaceId, periodStart),
    );

    return marker === true;
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
}
