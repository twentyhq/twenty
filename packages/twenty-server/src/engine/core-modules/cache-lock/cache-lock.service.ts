import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
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
  private readonly logger = new Logger(CacheLockService.name);

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
      const token = await this.cacheStorageService.acquireLock(key, ttl);

      if (isDefined(token)) {
        // Renewing the lease while fn runs keeps a slow critical section from
        // outliving the TTL and letting a second caller in
        const leaseRenewal = setInterval(() => {
          void this.renewLease(key, token, ttl);
        }, ttl / 3);

        try {
          return await fn();
        } finally {
          clearInterval(leaseRenewal);

          try {
            await this.cacheStorageService.releaseLock(key, token);
          } catch (releaseError) {
            this.logger.warn(
              `Failed to release lock for key "${key}": ${releaseError}`,
            );
          }
        }
      }

      await this.delay(ms);
    }

    throw new CacheLockException(
      `Failed to acquire lock for key: ${key}`,
      CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT,
    );
  }

  private async renewLease(key: string, token: string, ttl: number) {
    try {
      const extended = await this.cacheStorageService.extendLock(
        key,
        token,
        ttl,
      );

      if (!extended) {
        this.logger.warn(`Lost lock for key "${key}" before it was released`);
      }
    } catch (error) {
      this.logger.warn(`Failed to renew lock for key "${key}": ${error}`);
    }
  }
}
