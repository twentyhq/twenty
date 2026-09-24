import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_SCRIPT } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-script.constant';
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
    const ttl = timeWindow * 2;

    try {
      const remainingTokens = await this.cacheStorage.runScript<number>({
        script: TOKEN_BUCKET_THROTTLE_SCRIPT,
        keys: [key],
        args: [
          tokensToConsume.toString(),
          maxTokens.toString(),
          timeWindow.toString(),
          now.toString(),
          ttl.toString(),
        ],
      });

      if (remainingTokens === -1) {
        throw new ThrottlerException(
          `Limit reached (${maxTokens} tokens per ${timeWindow} ms)`,
          ThrottlerExceptionCode.LIMIT_REACHED,
        );
      }

      return remainingTokens;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw error;
      }

      return this.fallbackTokenBucketThrottleOrThrow(
        key,
        tokensToConsume,
        maxTokens,
        timeWindow,
        now,
      );
    }
  }

  async consumeTokens(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
  ) {
    try {
      await this.tokenBucketThrottleOrThrow(
        key,
        tokensToConsume,
        maxTokens,
        timeWindow,
      );
    } catch (error) {
      if (
        error instanceof ThrottlerException &&
        error.code === ThrottlerExceptionCode.LIMIT_REACHED
      ) {
        return;
      }

      throw error;
    }
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

    const refillAmount = Math.floor(
      Math.max(0, now - lastRefillAt) * refillRate,
    );

    return Math.min(tokens + refillAmount, maxTokens);
  }

  private async fallbackTokenBucketThrottleOrThrow(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
    now: number,
  ): Promise<number> {
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
}
