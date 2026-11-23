import { Injectable } from '@nestjs/common';

import { TAB_PRESENCE_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UPDATE_OWNED_KEY_LEASE_SCRIPT } from 'src/engine/core-modules/cache-storage/constants/update-owned-key-lease-script.constant';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TabPresenceStatus } from 'src/engine/core-modules/tab-presence/enums/tab-presence-status.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FOCUSED_TAB_TTL_MS = TAB_PRESENCE_HEARTBEAT_INTERVAL_MS * 2;
const ONLINE_TTL_MS = TAB_PRESENCE_HEARTBEAT_INTERVAL_MS * 5;

type WorkspaceMemberKeyParams = {
  workspaceId: string;
  workspaceMemberId: string;
};

const getFocusedTabKey = ({
  workspaceId,
  workspaceMemberId,
}: WorkspaceMemberKeyParams) =>
  `focused-tab:${workspaceId}:${workspaceMemberId}`;

const getOnlineKey = ({
  workspaceId,
  workspaceMemberId,
}: WorkspaceMemberKeyParams) => `online:${workspaceId}:${workspaceMemberId}`;

type TabPresenceUpdate = {
  workspaceId: string;
  workspaceMemberId: string;
  tabId: string;
  status: TabPresenceStatus;
};

@Injectable()
export class TabPresenceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineTabPresence)
    private readonly cacheStorageService: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async updateTabPresence(tabPresenceUpdate: TabPresenceUpdate): Promise<void> {
    const { workspaceId, workspaceMemberId } = tabPresenceUpdate;

    await Promise.all([
      this.updateFocusedTab(tabPresenceUpdate),
      this.cacheStorageService.set(
        getOnlineKey({ workspaceId, workspaceMemberId }),
        true,
        ONLINE_TTL_MS,
      ),
    ]);
  }

  private async updateFocusedTab({
    workspaceId,
    workspaceMemberId,
    tabId,
    status,
  }: TabPresenceUpdate): Promise<void> {
    const focusedTabKey = getFocusedTabKey({
      workspaceId,
      workspaceMemberId,
    });

    if (status === TabPresenceStatus.FOCUSED) {
      await this.cacheStorageService.set(
        focusedTabKey,
        tabId,
        FOCUSED_TAB_TTL_MS,
      );

      return;
    }

    await this.cacheStorageService.runScript<number>({
      script: UPDATE_OWNED_KEY_LEASE_SCRIPT,
      keys: [focusedTabKey],
      args: [JSON.stringify(tabId), '0'],
    });
  }

  async findOnlineWorkspaceMemberIds(workspaceId: string): Promise<string[]> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const onlineWorkspaceMemberIds = await this.findWorkspaceMemberIdsWithKey({
      workspaceMemberIds: Object.keys(flatWorkspaceMemberMaps.byId),
      getKey: (workspaceMemberId) =>
        getOnlineKey({ workspaceId, workspaceMemberId }),
    });

    return [...onlineWorkspaceMemberIds];
  }

  async findWorkspaceMemberIdsWithFocusedTab({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<Set<string>> {
    return this.findWorkspaceMemberIdsWithKey({
      workspaceMemberIds,
      getKey: (workspaceMemberId) =>
        getFocusedTabKey({ workspaceId, workspaceMemberId }),
    });
  }

  private async findWorkspaceMemberIdsWithKey({
    workspaceMemberIds,
    getKey,
  }: {
    workspaceMemberIds: string[];
    getKey: (workspaceMemberId: string) => string;
  }): Promise<Set<string>> {
    if (workspaceMemberIds.length === 0) {
      return new Set();
    }

    const values = await this.cacheStorageService.mget(
      workspaceMemberIds.map(getKey),
    );

    return new Set(
      workspaceMemberIds.filter((_, index) => isDefined(values[index])),
    );
  }
}
