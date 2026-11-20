import { Injectable } from '@nestjs/common';

import { TAB_PRESENCE_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UPDATE_OWNED_KEY_LEASE_SCRIPT } from 'src/engine/core-modules/cache-storage/constants/update-owned-key-lease-script.constant';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { REFRESH_OPEN_TAB_SCRIPT } from 'src/engine/core-modules/tab-presence/constants/refresh-open-tab-script.constant';
import { TabPresenceStatus } from 'src/engine/core-modules/tab-presence/enums/tab-presence-status.enum';

const FOCUSED_TAB_TTL_MS = TAB_PRESENCE_HEARTBEAT_INTERVAL_MS * 2;
const OPEN_TAB_TTL_MS = TAB_PRESENCE_HEARTBEAT_INTERVAL_MS * 5;

const getFocusedTabKey = (workspaceId: string, workspaceMemberId: string) =>
  `focused-tab:${workspaceId}:${workspaceMemberId}`;

const getOpenTabsKey = (workspaceId: string) => `open-tabs:${workspaceId}`;

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
  ) {}

  async updateTabPresence(tabPresenceUpdate: TabPresenceUpdate): Promise<void> {
    await Promise.all([
      this.updateFocusedTab(tabPresenceUpdate),
      this.updateOpenTab(tabPresenceUpdate),
    ]);
  }

  private async updateFocusedTab({
    workspaceId,
    workspaceMemberId,
    tabId,
    status,
  }: TabPresenceUpdate): Promise<void> {
    const focusedTabKey = getFocusedTabKey(workspaceId, workspaceMemberId);

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

  private async updateOpenTab({
    workspaceId,
    workspaceMemberId,
    tabId,
    status,
  }: TabPresenceUpdate): Promise<void> {
    const openTabsKey = getOpenTabsKey(workspaceId);
    const openTab = `${workspaceMemberId}:${tabId}`;

    if (status === TabPresenceStatus.CLOSED) {
      await this.cacheStorageService.sortedSetRemove(openTabsKey, [openTab]);

      return;
    }

    const now = Date.now();

    await this.cacheStorageService.runScript<number>({
      script: REFRESH_OPEN_TAB_SCRIPT,
      keys: [openTabsKey],
      args: [
        String(now),
        String(now + OPEN_TAB_TTL_MS),
        openTab,
        String(OPEN_TAB_TTL_MS),
      ],
    });
  }

  async findOnlineWorkspaceMemberIds(workspaceId: string): Promise<string[]> {
    const openTabs = await this.cacheStorageService.sortedSetRangeByScore(
      getOpenTabsKey(workspaceId),
      Date.now(),
      Infinity,
    );

    return [...new Set(openTabs.map((openTab) => openTab.split(':')[0]))];
  }

  async findWorkspaceMemberIdsWithFocusedTab({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<Set<string>> {
    if (workspaceMemberIds.length === 0) {
      return new Set();
    }

    const focusedTabIds = await this.cacheStorageService.mget<string>(
      workspaceMemberIds.map((workspaceMemberId) =>
        getFocusedTabKey(workspaceId, workspaceMemberId),
      ),
    );

    return new Set(
      workspaceMemberIds.filter((_, index) => isDefined(focusedTabIds[index])),
    );
  }
}
