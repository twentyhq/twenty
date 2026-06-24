import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { getDueTriggerTimestamp } from 'src/utils/get-due-trigger-timestamp.utils';

const CRON_DISPATCH_DEDUP_TTL_MS = 2 * 60_000;

@Injectable()
export class CronTriggerDeduplicationService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async shouldDispatch(
    keyPrefix: string,
    pattern: string,
    now: Date,
  ): Promise<boolean> {
    const triggerTimestamp = getDueTriggerTimestamp(pattern, now);

    if (triggerTimestamp === null) {
      return false;
    }

    const dedupKey = `${keyPrefix}:${triggerTimestamp}`;

    if (await this.cacheStorageService.get<boolean>(dedupKey)) {
      return false;
    }

    await this.cacheStorageService.set(
      dedupKey,
      true,
      CRON_DISPATCH_DEDUP_TTL_MS,
    );

    return true;
  }
}
