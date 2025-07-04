import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

export type LockOptions = {
  retryDelay?: number;
  maxRetries?: number;
  ttl?: number;
};

@Injectable()
export class LockService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async withLock<T>(
    fn: () => Promise<T>,
    key: string,
    options?: LockOptions,
  ): Promise<T> {
    const { retryDelay = 50, maxRetries = 20, ttl = 500 } = options || {};

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const acquired = await this.cacheStorageService.acquireLock(key, ttl);

      if (acquired) {
        try {
          return await fn();
        } finally {
          await this.cacheStorageService.releaseLock(key);
        }
      }

      await new Promise((res) => setTimeout(res, retryDelay));
    }

    throw new Error(`Failed to acquire lock for key: ${key}`);
  }
}
