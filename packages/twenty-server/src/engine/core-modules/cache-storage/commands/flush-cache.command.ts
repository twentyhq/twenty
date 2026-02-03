import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import {
    type CacheFlushTarget,
    CACHE_FLUSH_TARGET_DEFAULT,
    CACHE_FLUSH_TARGET_VALUES,
} from 'src/engine/core-modules/cache-storage/types/cache-flush-target.type';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Command({
  name: 'cache:flush',
  description:
    'Flush cache for specific keys matching the pattern. By default flushes the cache Redis (eviction, REDIS_URL). Use --cache=queue for the queue Redis (REDIS_QUEUE_URL, or REDIS_URL when not set).',
})
export class FlushCacheCommand extends CommandRunner {
  private readonly logger = new Logger(FlushCacheCommand.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
    private readonly redisClientService: RedisClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ): Promise<void> {
    const cacheTarget = this.parseCacheTarget(options?.cache);
    const pattern = options?.pattern ?? '*';

    if (cacheTarget === 'queue' && !this.twentyConfigService.get('REDIS_QUEUE_URL')) {
      this.logger.log(
        'REDIS_QUEUE_URL is not set; queue uses the same Redis as cache (REDIS_URL).',
      );
    }

    this.logger.log(
      `Flushing ${cacheTarget} cache for pattern: ${pattern}...`,
    );

    if (cacheTarget === 'cache') {
      await this.flushCacheRedis(pattern);
    } else {
      await this.flushQueueRedis(pattern);
    }

    this.logger.log('Cache flushed');
  }

  private async flushCacheRedis(pattern: string): Promise<void> {
    if (pattern === '*') {
      await this.cacheStorage.flush();
    } else {
      await this.cacheStorage.flushByPattern(pattern);
    }
  }

  private async flushQueueRedis(pattern: string): Promise<void> {
    const redisClient = this.redisClientService.getQueueClient();

    if (pattern === '*') {
      await redisClient.flushdb();
    } else {
      let cursor = '0';

      do {
        const [nextCursor, keys] = await redisClient.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          '100',
        );

        cursor = nextCursor;

        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } while (cursor !== '0');
    }
  }

  private parseCacheTarget(value: unknown): CacheFlushTarget {
    if (
      typeof value === 'string' &&
      CACHE_FLUSH_TARGET_VALUES.includes(value as CacheFlushTarget)
    ) {
      return value as CacheFlushTarget;
    }

    return CACHE_FLUSH_TARGET_DEFAULT;
  }

  @Option({
    flags: '-c, --cache <cache>',
    description: `Redis to flush: "cache" (eviction, REDIS_URL) or "queue" (no eviction, REDIS_QUEUE_URL). Default: cache`,
  })
  parseCache(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --pattern <pattern>',
    description:
      'Pattern to flush specific cache keys (e.g., engine:*, bull:*). Use * to flush all. For cache Redis keys are prefixed with namespace.',
  })
  parsePattern(val: string): string {
    return val;
  }
}
