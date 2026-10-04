import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CONSUME_TOKEN_BUCKET_SCRIPT } from 'src/engine/core-modules/throttler/constants/consume-token-bucket-script.constant';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
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
  ): Promise<void> {
    const [admittedCount] = await this.cacheStorage.runScript<number[]>({
      script: TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
      keys: [`${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${key}`],
      args: [
        String(tokensToConsume),
        JSON.stringify([
          { burst: maxTokens, refill: maxTokens, windowMs: timeWindow },
        ]),
        TOKEN_BUCKETS_DENY_PARTIAL_ARG,
      ],
    });

    if (admittedCount !== tokensToConsume) {
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
    await this.cacheStorage.runScript<number>({
      script: CONSUME_TOKEN_BUCKET_SCRIPT,
      keys: [key],
      args: [
        String(tokensToConsume),
        String(maxTokens),
        String(timeWindow),
        String(Date.now()),
      ],
    });
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
