import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';

@Injectable()
export class ThrottlerService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async tokenBucketThrottleOrThrow(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
  ): Promise<number> {
    const now = Date.now();
    const availableTokens = await this.getAvailableTokensCount(
      key,
      maxTokens,
      timeWindow,
      now,
    );

    if (availableTokens < tokensToConsume) {
      throw new ThrottlerException(
        `Limit reached (${maxTokens} tokens per ${timeWindow} ms)`,
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }

    await this.cacheStorage.set(
      key,
      {
        tokens: availableTokens - tokensToConsume,
        lastRefillAt: now,
      },
      timeWindow * 2,
    );

    return availableTokens - tokensToConsume;
  }

  async consumeTokens(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
  ) {
    const now = Date.now();
    const availableTokens = await this.getAvailableTokensCount(
      key,
      maxTokens,
      timeWindow,
      now,
    );

    await this.cacheStorage.set(
      key,
      {
        tokens: availableTokens - tokensToConsume,
        lastRefillAt: now,
      },
      timeWindow * 2,
    );
  }

  async runWithFailureLimitOrThrow<TResult>({
    limits,
    timeWindow,
    attempt,
  }: {
    limits: { key: string; maxFailures: number }[];
    timeWindow: number;
    attempt: () => Promise<TResult>;
  }): Promise<TResult> {
    const failureCounts = await Promise.all(
      limits.map(async ({ key }) => {
        const failureCount = await this.cacheStorage.incrBy(key, 1);

        await this.cacheStorage.expire(key, timeWindow);

        return failureCount;
      }),
    );

    const exceededLimit = limits.find(
      ({ maxFailures }, index) => failureCounts[index] > maxFailures,
    );

    if (isDefined(exceededLimit)) {
      await this.releaseFailureReservations(limits);

      throw new ThrottlerException(
        `Limit reached (${exceededLimit.maxFailures} failed attempts per ${timeWindow} ms)`,
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }

    const result = await attempt();

    await this.releaseFailureReservations(limits);

    return result;
  }

  async getAvailableTokensCount(
    key: string,
    maxTokens: number,
    timeWindow: number,
    now = Date.now(),
  ): Promise<number> {
    const refillRate = maxTokens / timeWindow;

    const { tokens, lastRefillAt } = (await this.cacheStorage.get<{
      tokens: number;
      lastRefillAt: number;
    }>(key)) || { tokens: maxTokens, lastRefillAt: now };

    const refillAmount = Math.floor((now - lastRefillAt) * refillRate);

    return Math.min(tokens + refillAmount, maxTokens);
  }

  private async releaseFailureReservations(
    limits: { key: string }[],
  ): Promise<void> {
    await Promise.all(
      limits.map(({ key }) => this.cacheStorage.incrBy(key, -1)),
    );
  }
}
