import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';

export const APPLICATION_KILL_SWITCH_LOCAL_CACHE_TTL_MS = 60_000;

type ApplicationKillSwitchCacheEntry = {
  isStopped: boolean;
};

@Injectable()
export class ApplicationStopService {
  private readonly memoizer =
    new PromiseMemoizer<ApplicationKillSwitchCacheEntry>(
      APPLICATION_KILL_SWITCH_LOCAL_CACHE_TTL_MS,
    );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async stop(applicationUniversalIdentifier: string): Promise<void> {
    await this.cacheStorageService.set(
      this.getKillSwitchKey(applicationUniversalIdentifier),
      'stopped',
    );
  }

  async remove(applicationUniversalIdentifier: string): Promise<void> {
    await this.cacheStorageService.del(
      this.getKillSwitchKey(applicationUniversalIdentifier),
    );
  }

  async isApplicationStopped(
    applicationUniversalIdentifier: string,
  ): Promise<boolean> {
    const cacheEntry = await this.memoizer.memoizePromiseAndExecute(
      `application-${applicationUniversalIdentifier}`,
      () => this.readKillSwitch(applicationUniversalIdentifier),
    );

    return cacheEntry?.isStopped ?? false;
  }

  private async readKillSwitch(
    applicationUniversalIdentifier: string,
  ): Promise<ApplicationKillSwitchCacheEntry> {
    try {
      const isStopped =
        (await this.cacheStorageService.get(
          this.getKillSwitchKey(applicationUniversalIdentifier),
        )) !== undefined;

      return { isStopped };
    } catch {
      return { isStopped: false };
    }
  }

  private getKillSwitchKey(applicationUniversalIdentifier: string): string {
    return `kill-switch:${applicationUniversalIdentifier}`;
  }
}
