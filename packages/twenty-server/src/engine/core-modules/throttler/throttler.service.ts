import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import {
  TOKEN_BUCKETS_ALLOW_PARTIAL_ARG,
  TOKEN_BUCKETS_DENY_PARTIAL_ARG,
  TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
} from 'src/engine/core-modules/throttler/constants/try-consume-token-buckets-script.constant';

type TokenBucket = {
  key: string;
  burst: number;
  refillPerWindow: number;
  windowMs: number;
};

@Injectable()
export class ThrottlerService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async tryConsumeTokenBuckets({
    buckets,
    tokensToConsume,
    allowPartial,
  }: {
    buckets: TokenBucket[];
    tokensToConsume: number;
    allowPartial: boolean;
  }): Promise<
    [
      admittedCount: number,
      exhaustedBucketPosition: number,
      retryAfterMs: number,
    ]
  > {
    return this.cacheStorage.runScript({
      script: TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
      keys: buckets.map(
        (bucket) => `${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${bucket.key}`,
      ),
      args: [
        String(tokensToConsume),
        JSON.stringify(
          buckets.map((bucket) => ({
            burst: bucket.burst,
            refill: bucket.refillPerWindow,
            windowMs: bucket.windowMs,
          })),
        ),
        allowPartial
          ? TOKEN_BUCKETS_ALLOW_PARTIAL_ARG
          : TOKEN_BUCKETS_DENY_PARTIAL_ARG,
      ],
    });
  }

  async tokenBucketThrottleOrThrow(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
  ): Promise<void> {
    const [admittedCount] = await this.tryConsumeTokenBuckets({
      buckets: [
        {
          key,
          burst: maxTokens,
          refillPerWindow: maxTokens,
          windowMs: timeWindow,
        },
      ],
      tokensToConsume,
      allowPartial: false,
    });

    if (admittedCount !== tokensToConsume) {
      throw new ThrottlerException(
        `Limit reached (${maxTokens} tokens per ${timeWindow} ms)`,
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }
  }

  async tokenBucketConsumeUpTo(
    key: string,
    tokensToConsume: number,
    maxTokens: number,
    timeWindow: number,
  ): Promise<number> {
    const [admittedCount] = await this.tryConsumeTokenBuckets({
      buckets: [
        {
          key,
          burst: maxTokens,
          refillPerWindow: maxTokens,
          windowMs: timeWindow,
        },
      ],
      tokensToConsume,
      allowPartial: true,
    });

    return admittedCount;
  }
}
