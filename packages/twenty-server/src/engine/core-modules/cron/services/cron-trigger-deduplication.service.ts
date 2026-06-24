import { Injectable } from '@nestjs/common';

import { CronExpressionParser } from 'cron-parser';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const ROOT_CRON_INTERVAL_MS = 60_000;
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
    let lastTriggerTimestamp: number;

    try {
      lastTriggerTimestamp = CronExpressionParser.parse(pattern, {
        currentDate: now,
      })
        .prev()
        .getTime();
    } catch {
      return false;
    }

    const isDueWithinThisTick =
      now.getTime() - lastTriggerTimestamp < ROOT_CRON_INTERVAL_MS;

    if (!isDueWithinThisTick) {
      return false;
    }

    const dedupKey = `${keyPrefix}:${lastTriggerTimestamp}`;

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
