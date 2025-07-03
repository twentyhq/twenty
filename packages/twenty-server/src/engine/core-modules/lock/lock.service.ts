import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

@Injectable()
export class LockService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async withLock<T>(rowId: number | string, fn: () => Promise<T>): Promise<T> {
    const previous = locks.get(rowId) || Promise.resolve();

    let release: () => void;
    const current = new Promise<void>((res) => (release = res));

    locks.set(
      rowId,
      previous.then(() => current),
    );

    try {
      await previous; // wait for any prior task on this row

      return await fn(); // run the locked function
    } finally {
      release!(); // allow next in queue
      // Clean up if no pending operations
      if (locks.get(rowId) === current) {
        locks.delete(rowId);
      }
    }
  }
}
