import { Logger } from '@nestjs/common';

import { type CacheModuleOptions } from '@nestjs/cache-manager';

import { redisInsStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const cacheStorageLogger = new Logger('CacheStorage');

const REDIS_PING_INTERVAL_MS = 60_000;

export const cacheStorageModuleFactory = (
  twentyConfigService: TwentyConfigService,
): CacheModuleOptions => {
  const cacheStorageType = CacheStorageType.Redis;
  const cacheStorageTtl = twentyConfigService.get('CACHE_STORAGE_TTL');
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheStorageTtl * 1000,
  };

  switch (cacheStorageType) {
    /* case CacheStorageType.Memory: {
      return cacheModuleOptions;
    }*/
    case CacheStorageType.Redis: {
      const redisUrl = twentyConfigService.get('REDIS_URL');

      if (!redisUrl) {
        throw new Error(
          `${cacheStorageType} cache storage requires REDIS_URL to be defined, check your .env file`,
        );
      }

      return {
        ...cacheModuleOptions,
        store: async () => {
          const redisClient = createClient({
            url: redisUrl,
            pingInterval: REDIS_PING_INTERVAL_MS,
          });

          redisClient.on('error', (err) => {
            cacheStorageLogger.error('Redis cache-storage client error', err);
          });

          await redisClient.connect();

          return redisInsStore(
            redisClient as Parameters<typeof redisInsStore>[0],
            { ttl: cacheStorageTtl * 1000 },
          );
        },
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
