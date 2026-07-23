import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export const APPLICATION_KILL_SWITCH_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ApplicationStopService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async stopApplication({
    applicationUniversalIdentifier,
  }: {
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    await this.cacheStorageService.set(
      this.getKillSwitchKey(applicationUniversalIdentifier),
      true,
      APPLICATION_KILL_SWITCH_TTL_MS,
    );
  }

  async startApplication({
    applicationUniversalIdentifier,
  }: {
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    await this.cacheStorageService.del(
      this.getKillSwitchKey(applicationUniversalIdentifier),
    );
  }

  async isApplicationStopped(
    applicationUniversalIdentifier: string,
  ): Promise<boolean> {
    try {
      return (
        (await this.cacheStorageService.get(
          this.getKillSwitchKey(applicationUniversalIdentifier),
        )) !== undefined
      );
    } catch {
      return false;
    }
  }

  private getKillSwitchKey(applicationUniversalIdentifier: string): string {
    return `kill-switch:${applicationUniversalIdentifier}`;
  }
}
