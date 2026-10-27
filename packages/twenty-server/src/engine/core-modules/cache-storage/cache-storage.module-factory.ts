import { Logger } from '@nestjs/common';

import { type CacheModuleOptions } from '@nestjs/cache-manager';

import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { createClient } from 'redis';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const cacheStorageLogger = new Logger('CacheStorage');

const REDIS_PING_INTERVAL_MS = 60_000;

export const cacheStorageModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<CacheModuleOptions> => {
  const cacheStorageType = CacheStorageType.Redis;
  const cacheStorageTtl = twentyConfigService.get('CACHE_STORAGE_TTL');
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheStorageTtl * 1000,
  };

  switch (cacheStorageType) {
    case CacheStorageType.Redis: {
      const redisUrl = twentyConfigService.get('REDIS_URL');

      if (!redisUrl) {
        throw new Error(
          `${cacheStorageType} cache storage requires REDIS_URL to be defined, check your .env file`,
        );
      }

      const redisClient = createClient({
        url: redisUrl,
        pingInterval: REDIS_PING_INTERVAL_MS,
      });

      redisClient.on('error', (error) => {
        cacheStorageLogger.error('Redis cache-storage client error', error);
      });

      await redisClient.connect();

      return {
        ...cacheModuleOptions,
        // CacheStorageService also reads these keys raw, so no Keyv prefix or wrapping
        stores: [
          new Keyv({
            store: new KeyvRedis(
              redisClient as ConstructorParameters<typeof KeyvRedis>[0],
            ),
            namespace: undefined,
            useKeyPrefix: false,
            serialize: ({ value }) => JSON.stringify(value),
            deserialize: (data) => ({ value: JSON.parse(data) }),
          }),
        ],
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
