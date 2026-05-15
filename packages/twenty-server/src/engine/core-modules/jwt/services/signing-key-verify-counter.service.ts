import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const WINDOW_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const BUCKET_TTL_MS = (WINDOW_DAYS + 1) * ONE_DAY_MS;
const FLUSH_INTERVAL_MS = 30 * 1000;
const REDIS_KEY_PREFIX = 'signing-key-verifies';
const LEGACY_BUCKET_ID = 'legacy';

export type SigningKeyUsage = {
  byKid: Record<string, number>;
  legacyCount: number;
  windowDays: number;
};

@Injectable()
export class SigningKeyVerifyCounterService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SigningKeyVerifyCounterService.name);

  private pendingCounts = new Map<string, number>();
  private flushIntervalHandle: NodeJS.Timeout | null = null;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineMetrics)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  onModuleInit() {
    this.flushIntervalHandle = setInterval(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);

    if (isDefined(this.flushIntervalHandle.unref)) {
      this.flushIntervalHandle.unref();
    }
  }

  async onModuleDestroy() {
    if (isDefined(this.flushIntervalHandle)) {
      clearInterval(this.flushIntervalHandle);
      this.flushIntervalHandle = null;
    }

    await this.flush();
  }

  recordKidVerify(kid: string): void {
    this.increment(kid);
  }

  recordLegacyVerify(): void {
    this.increment(LEGACY_BUCKET_ID);
  }

  async getUsageInWindow(kids: string[]): Promise<SigningKeyUsage> {
    await this.flush();

    const bucketIds = [...kids, LEGACY_BUCKET_ID];
    const allKeys = bucketIds.flatMap((bucketId) =>
      this.buildBucketKeysInWindow(bucketId),
    );

    let values: (number | string | undefined)[];

    try {
      values = await this.cacheStorage.mget<number | string>(allKeys);
    } catch (error) {
      this.logger.warn(
        `Failed to read signing key verify counts: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        byKid: Object.fromEntries(kids.map((kid) => [kid, 0])),
        legacyCount: 0,
        windowDays: WINDOW_DAYS,
      };
    }

    const countsByBucketId = new Map<string, number>(
      bucketIds.map((bucketId) => [bucketId, 0]),
    );

    for (let index = 0; index < values.length; index++) {
      const owner = bucketIds[Math.floor(index / WINDOW_DAYS)];

      countsByBucketId.set(
        owner,
        (countsByBucketId.get(owner) ?? 0) + this.toCount(values[index]),
      );
    }

    return {
      byKid: Object.fromEntries(
        kids.map((kid) => [kid, countsByBucketId.get(kid) ?? 0]),
      ),
      legacyCount: countsByBucketId.get(LEGACY_BUCKET_ID) ?? 0,
      windowDays: WINDOW_DAYS,
    };
  }

  private increment(bucketId: string): void {
    const key = this.buildBucketKey(bucketId, Date.now());

    this.pendingCounts.set(key, (this.pendingCounts.get(key) ?? 0) + 1);
  }

  private async flush(): Promise<void> {
    if (this.pendingCounts.size === 0) {
      return;
    }

    const snapshot = this.pendingCounts;

    this.pendingCounts = new Map();

    const entries = Array.from(snapshot.entries());
    const incrResults = await Promise.allSettled(
      entries.map(([key, increment]) =>
        this.cacheStorage.incrBy(key, increment),
      ),
    );

    const incrementedKeys: string[] = [];
    let failedCount = 0;

    for (let index = 0; index < entries.length; index++) {
      const [key, increment] = entries[index];

      if (incrResults[index].status === 'rejected') {
        this.pendingCounts.set(
          key,
          (this.pendingCounts.get(key) ?? 0) + increment,
        );
        failedCount++;
        continue;
      }

      incrementedKeys.push(key);
    }

    await Promise.allSettled(
      incrementedKeys.map((key) =>
        this.cacheStorage.expire(key, BUCKET_TTL_MS),
      ),
    );

    if (failedCount > 0) {
      this.logger.warn(
        `Failed to flush ${failedCount}/${entries.length} signing key verify bucket(s); re-buffered for next flush`,
      );
    }
  }

  private toCount(value: number | string | undefined): number {
    if (!isDefined(value)) {
      return 0;
    }

    if (isNumber(value)) {
      return Number.isFinite(value) ? value : 0;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private buildBucketKey(bucketId: string, timestamp: number): string {
    const bucketStart = Math.floor(timestamp / ONE_DAY_MS) * ONE_DAY_MS;

    return `${REDIS_KEY_PREFIX}:${bucketId}:${bucketStart}`;
  }

  private buildBucketKeysInWindow(bucketId: string): string[] {
    const currentBucketStart = Math.floor(Date.now() / ONE_DAY_MS) * ONE_DAY_MS;

    return Array.from(
      { length: WINDOW_DAYS },
      (_, index) =>
        `${REDIS_KEY_PREFIX}:${bucketId}:${currentBucketStart - index * ONE_DAY_MS}`,
    );
  }
}
