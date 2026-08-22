import type { AxiosInstance } from "axios";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { NavigationMenuItem } from "src/logic-functions/types/navigation-menu-item.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { setStateRef } from "src/logic-functions/utils/migration-state.util";

export const migrateNavigationMenuItems = async (
  targetWorkspace: AxiosInstance,
  sourceItems: NavigationMenuItem[],
  targetItems: NavigationMenuItem[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  recordIdMap: Map<string, string>,
  targetPageLayoutIdBySourcePageLayoutId: Map<string, string>,
) => {
  // Folders can be parents of other items, so an item is only attempted once its folder (if
  // any) is already resolved in the target. Items skipped for any reason (personal,
  // unresolved page layout/target) are never marked resolved, so anything nested under them is
  // correctly left unresolved too, rather than pointing at a folder that was never created.
  const resolvedItemIds = new Set(targetItems.map((item) => item.id));
  const remainingItems = sourceItems.sort((a,b) => {
    if (a.folderId !== null && b.folderId === null) return 1;
    if (a.folderId === null && b.folderId !== null) return -1;
    if (a.folderId === null && b.folderId === null) return 0;
    return 0;
  }).filter(item => resolvedItemIds.has(item.id) === false);
  let createdCount = 0;

  while (remainingItems.length > 0) {
    const creatableNow = remainingItems.filter(
      (item) => item.folderId === null || resolvedItemIds.has(item.folderId),
    );
    if (creatableNow.length === 0) {
      logger.warn(`Skipping ${remainingItems.length} navigation menu item(s): unresolved folder chain`);
      break;
    }

    for (const item of creatableNow) {
      remainingItems.splice(remainingItems.indexOf(item), 1);

      if (resolvedItemIds.has(item.id)) {
        continue;
      }
      if (item.userWorkspaceId !== null) {
        logger.warn(`Skipping personal navigation menu item "${item.name ?? item.id}": personal items aren't portable across workspaces via API key`);
        continue;
      }
      const targetPageLayoutId = item.pageLayoutId !== null
        ? targetPageLayoutIdBySourcePageLayoutId.get(item.pageLayoutId)
        : undefined;
      if (item.pageLayoutId !== null && targetPageLayoutId === undefined) {
        logger.warn(`Skipping navigation menu item "${item.name ?? item.id}": target page layout not found for page layout ${item.pageLayoutId}`);
        continue;
      }

      const targetObjectMetadataId = item.targetObjectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(item.targetObjectMetadataId)
        : undefined;
      if (item.targetObjectMetadataId !== null && targetObjectMetadataId === undefined) {
        logger.warn(`Skipping navigation menu item "${item.name ?? item.id}": target object not found for object ${item.targetObjectMetadataId}`);
        continue;
      }

      const targetRecordId = item.targetRecordId !== null
        ? recordIdMap.get(item.targetRecordId)
        : undefined;
      if (item.targetRecordId !== null && targetRecordId === undefined) {
        logger.warn(`Skipping navigation menu item "${item.name ?? item.id}": target record not found for record ${item.targetRecordId}`);
        continue;
      }

      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createNavigationMenuItem', 'input', 'CreateNavigationMenuItemInput', {
        id: item.id,
        targetRecordId: targetRecordId ?? null,
        targetObjectMetadataId: targetObjectMetadataId ?? null,
        viewId: item.viewId,
        type: item.type,
        name: item.name,
        link: item.link,
        icon: item.icon,
        color: item.color,
        folderId: item.folderId,
        pageLayoutId: targetPageLayoutId ?? null,
        position: item.position,
      }));
      resolvedItemIds.add(item.id);
      createdCount += 1;
    }
    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  setStateRef('migratedNavigationMenuItems', true);
  logger.log(`Navigation menu items: created ${createdCount}`);
  return true;
};