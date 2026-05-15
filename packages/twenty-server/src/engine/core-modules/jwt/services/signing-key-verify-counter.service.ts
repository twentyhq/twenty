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
import {
  SIGNING_KEY_USAGE_BUCKET_DURATION_MS,
  SIGNING_KEY_USAGE_FLUSH_INTERVAL_MS,
  SIGNING_KEY_USAGE_REDIS_KEY_PREFIX,
  SIGNING_KEY_USAGE_TTL_MS,
  SIGNING_KEY_USAGE_WINDOW_DAYS,
} from 'src/engine/core-modules/jwt/constants/signing-key-usage.constant';

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
    }, SIGNING_KEY_USAGE_FLUSH_INTERVAL_MS);

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

  recordVerify(identifier: string, now: number = Date.now()): void {
    const key = this.buildBucketKey(identifier, now);

    this.pendingCounts.set(key, (this.pendingCounts.get(key) ?? 0) + 1);
  }

  async getCountInWindow(
    identifier: string,
    now: number = Date.now(),
  ): Promise<number> {
    await this.flush();

    const keys = this.buildBucketKeysInWindow(identifier, now);

    try {
      const values = await this.cacheStorage.mget<number | string>(keys);

      return values.reduce<number>(
        (accumulator, value) => accumulator + this.toCount(value),
        0,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to read signing key verify counts for identifier=${identifier}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return 0;
    }
  }

  async getCountsInWindow(
    identifiers: string[],
    now: number = Date.now(),
  ): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    for (const identifier of identifiers) {
      counts[identifier] = 0;
    }

    if (identifiers.length === 0) {
      return counts;
    }

    await this.flush();

    const allKeys: string[] = [];
    const keyOwners: string[] = [];

    for (const identifier of identifiers) {
      const keys = this.buildBucketKeysInWindow(identifier, now);

      for (const key of keys) {
        allKeys.push(key);
        keyOwners.push(identifier);
      }
    }

    try {
      const values = await this.cacheStorage.mget<number | string>(allKeys);

      for (let index = 0; index < values.length; index++) {
        const owner = keyOwners[index];

        counts[owner] += this.toCount(values[index]);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to read signing key verify counts: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return counts;
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
        this.cacheStorage.expire(key, SIGNING_KEY_USAGE_TTL_MS),
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

  private getBucketStartMs(timestamp: number): number {
    return (
      Math.floor(timestamp / SIGNING_KEY_USAGE_BUCKET_DURATION_MS) *
      SIGNING_KEY_USAGE_BUCKET_DURATION_MS
    );
  }

  private buildBucketKey(identifier: string, timestamp: number): string {
    return `${SIGNING_KEY_USAGE_REDIS_KEY_PREFIX}:${identifier}:${this.getBucketStartMs(timestamp)}`;
  }

  private buildBucketKeysInWindow(identifier: string, now: number): string[] {
    const currentBucketStart = this.getBucketStartMs(now);

    return Array.from(
      { length: SIGNING_KEY_USAGE_WINDOW_DAYS },
      (_, index) =>
        `${SIGNING_KEY_USAGE_REDIS_KEY_PREFIX}:${identifier}:${
          currentBucketStart - index * SIGNING_KEY_USAGE_BUCKET_DURATION_MS
        }`,
    );
  }
}
