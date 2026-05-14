import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  SIGNING_KEY_USAGE_BUCKET_DURATION_MS,
  SIGNING_KEY_USAGE_REDIS_KEY_PREFIX,
  SIGNING_KEY_USAGE_TTL_MS,
  SIGNING_KEY_USAGE_WINDOW_DAYS,
} from 'src/engine/core-modules/jwt/constants/signing-key-usage.constant';

@Injectable()
export class SigningKeyVerifyCounterService {
  private readonly logger = new Logger(SigningKeyVerifyCounterService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineMetrics)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async recordVerify(
    identifier: string,
    now: number = Date.now(),
  ): Promise<void> {
    try {
      const key = this.buildBucketKey(identifier, now);

      await this.cacheStorage.incrBy(key, 1);
      await this.cacheStorage.expire(key, SIGNING_KEY_USAGE_TTL_MS);
    } catch (error) {
      this.logger.warn(
        `Failed to record signing key verify for identifier=${identifier}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getCountInWindow(
    identifier: string,
    now: number = Date.now(),
  ): Promise<number> {
    const keys = this.buildBucketKeysInWindow(identifier, now);
    const values = await this.cacheStorage.mget<number | string>(keys);

    return values.reduce<number>(
      (accumulator, value) => accumulator + this.toCount(value),
      0,
    );
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

    const allKeys: string[] = [];
    const keyOwners: string[] = [];

    for (const identifier of identifiers) {
      const keys = this.buildBucketKeysInWindow(identifier, now);

      for (const key of keys) {
        allKeys.push(key);
        keyOwners.push(identifier);
      }
    }

    const values = await this.cacheStorage.mget<number | string>(allKeys);

    for (let index = 0; index < values.length; index++) {
      const owner = keyOwners[index];

      counts[owner] += this.toCount(values[index]);
    }

    return counts;
  }

  private toCount(value: number | string | undefined): number {
    if (!isDefined(value)) {
      return 0;
    }

    if (typeof value === 'number') {
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
