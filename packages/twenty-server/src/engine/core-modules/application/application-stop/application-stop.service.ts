import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

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

  async stop(
    applicationUniversalIdentifier: string,
    workspaceId?: string,
  ): Promise<void> {
    await this.cacheStorageService.set(
      this.getKillSwitchKey(applicationUniversalIdentifier, workspaceId),
      'stopped',
    );
  }

  async isApplicationStopped(
    applicationUniversalIdentifier: string,
    workspaceId?: string,
  ): Promise<boolean> {
    const memoizerKey: CacheKey = isDefined(workspaceId)
      ? `application-${applicationUniversalIdentifier}-workspace-${workspaceId}`
      : `application-${applicationUniversalIdentifier}`;

    const cacheEntry = await this.memoizer.memoizePromiseAndExecute(
      memoizerKey,
      () => this.readKillSwitch(applicationUniversalIdentifier, workspaceId),
    );

    return cacheEntry?.isStopped ?? false;
  }

  private async readKillSwitch(
    applicationUniversalIdentifier: string,
    workspaceId?: string,
  ): Promise<ApplicationKillSwitchCacheEntry> {
    try {
      const isGloballyStopped =
        (await this.cacheStorageService.get(
          this.getKillSwitchKey(applicationUniversalIdentifier),
        )) !== undefined;

      if (isGloballyStopped || !isDefined(workspaceId)) {
        return { isStopped: isGloballyStopped };
      }

      const isStoppedOnWorkspace =
        (await this.cacheStorageService.get(
          this.getKillSwitchKey(applicationUniversalIdentifier, workspaceId),
        )) !== undefined;

      return { isStopped: isStoppedOnWorkspace };
    } catch {
      return { isStopped: false };
    }
  }

  private getKillSwitchKey(
    applicationUniversalIdentifier: string,
    workspaceId?: string,
  ): string {
    return isDefined(workspaceId)
      ? `kill-switch:${applicationUniversalIdentifier}:workspace:${workspaceId}`
      : `kill-switch:${applicationUniversalIdentifier}`;
  }
}
