import { CacheModuleOptions } from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-yet';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

export const cacheStorageModuleFactory = (
  environmentService: EnvironmentService,
  redisClientService: RedisClientService,
): CacheModuleOptions => {
  const cacheStorageType = environmentService.get('CACHE_STORAGE_TYPE');
  const cacheStorageTtl = environmentService.get('CACHE_STORAGE_TTL');
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheStorageTtl * 1000,
  };

  switch (cacheStorageType) {
    case CacheStorageType.Memory: {
      return cacheModuleOptions;
    }
    case CacheStorageType.Redis: {
      return {
        ...cacheModuleOptions,
        store: redisStore,
        client: redisClientService.getClient(),
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
