import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const FOCUSED_TAB_TTL_MS = 45_000;

const getFocusedTabKey = ({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) => `focused-tab:${workspaceId}:${userId}`;

@Injectable()
export class WebPushPresenceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async updateFocusedTab({
    workspaceId,
    userId,
    tabId,
    isFocused,
  }: {
    workspaceId: string;
    userId: string;
    tabId: string;
    isFocused: boolean;
  }): Promise<void> {
    const key = getFocusedTabKey({ workspaceId, userId });

    if (isFocused) {
      await this.cacheStorageService.set(key, tabId, FOCUSED_TAB_TTL_MS);

      return;
    }

    if ((await this.cacheStorageService.get<string>(key)) === tabId) {
      await this.cacheStorageService.del(key);
    }
  }

  async hasFocusedTab({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<boolean> {
    return isDefined(
      await this.cacheStorageService.get<string>(
        getFocusedTabKey({ workspaceId, userId }),
      ),
    );
  }
}
