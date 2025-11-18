import { type CacheModuleOptions } from '@nestjs/cache-manager';

import { redisStore } from 'cache-manager-redis-yet';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
        store: redisStore,
        url: redisUrl,
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
