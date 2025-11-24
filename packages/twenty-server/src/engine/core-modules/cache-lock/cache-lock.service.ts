import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

export type CacheLockOptions = {
  ms?: number;
  maxRetries?: number;
  ttl?: number;
};

@Injectable()
export class CacheLockService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async withLock<T>(
    fn: () => Promise<T>,
    key: string,
    options?: CacheLockOptions,
  ): Promise<T> {
    const { ms = 100, maxRetries = 50, ttl = 5_500 } = options || {};

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const acquired = await this.cacheStorageService.acquireLock(key, ttl);

      if (acquired) {
        try {
          return await fn();
        } finally {
          await this.cacheStorageService.releaseLock(key);
        }
      }

      await this.delay(ms);
    }

    throw new Error(`Failed to acquire lock for key: ${key}`);
  }
}
