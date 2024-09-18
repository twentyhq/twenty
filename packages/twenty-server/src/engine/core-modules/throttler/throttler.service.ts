import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';

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
