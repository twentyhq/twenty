import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import {
  TOKEN_BUCKETS_DENY_PARTIAL_ARG,
  TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
} from 'src/engine/core-modules/throttler/constants/try-consume-token-buckets-script.constant';

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

  // Same bucket semantics as tokenBucketThrottleOrThrow, but the read and the
  // write happen in one Redis script, so concurrent callers cannot all spend
  // the same token. Use it wherever the limit guards against guessing.
  async atomicTokenBucketThrottleOrThrow({
    key,
    maxTokens,
    timeWindow,
  }: {
    key: string;
    maxTokens: number;
    timeWindow: number;
  }): Promise<void> {
    const [admittedCount] = await this.cacheStorage.runScript<number[]>({
      script: TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
      keys: [key],
      args: [
        '1',
        JSON.stringify([
          { burst: maxTokens, refill: maxTokens, windowMs: timeWindow },
        ]),
        TOKEN_BUCKETS_DENY_PARTIAL_ARG,
      ],
    });

    if (admittedCount !== 1) {
      throw new ThrottlerException(
        `Limit reached (${maxTokens} tokens per ${timeWindow} ms)`,
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }
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
}
