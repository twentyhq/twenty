import { Injectable } from '@nestjs/common';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

@Injectable()
export class ThrottlerService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async throttle(key: string, limit: number, ttl: number): Promise<void> {
    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    if (currentCount >= limit) {
      throw new ThrottlerException(
        'Too many requests',
        ThrottlerExceptionCode.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheStorage.set(key, currentCount + 1, ttl);
  }
}
