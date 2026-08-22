import type { AxiosInstance } from "axios";
import { createManyMetadataEntities } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { NavigationMenuItem } from "src/logic-functions/types/navigation-menu-item.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { setStateRef } from "src/logic-functions/utils/migration-state.util";
import { createParentChainQueue } from "src/logic-functions/utils/parent-chain-queue.util";
import { RecordIdResolution, resolveTargetRecordId } from "src/logic-functions/utils/record-id-resolution.util";

export const migrateNavigationMenuItems = async (
  targetWorkspace: AxiosInstance,
  sourceItems: NavigationMenuItem[],
  targetItems: NavigationMenuItem[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  recordIds: RecordIdResolution,
  targetPageLayoutIdBySourcePageLayoutId: Map<string, string>,
) => {
  // Folders can be parents of other items, so an item is only attempted once its folder (if
  // any) is already resolved in the target. Items skipped for any reason (personal,
  // unresolved page layout/target) are never marked resolved, so anything nested under them is
  // correctly left unresolved too, rather than pointing at a folder that was never created.
  const resolvedItemIds = new Set(targetItems.map((item) => item.id));
  const itemsToProcess = sourceItems.filter((item) => resolvedItemIds.has(item.id) === false);
  const itemQueue = createParentChainQueue(
    itemsToProcess,
    (item) => item.id,
    (item) => item.folderId,
    resolvedItemIds,
  );
  let createdCount = 0;
  let processedCount = 0;

  while (itemQueue.hasPending()) {
    const resolvedInWave: NavigationMenuItem[] = [];
    const itemsToCreate: Record<string, unknown>[] = [];

    for (const item of itemQueue.drainWave()) {
      processedCount += 1;

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
        ? resolveTargetRecordId(recordIds, item.targetRecordId)
        : undefined;
      if (item.targetRecordId !== null && targetRecordId === undefined) {
        logger.warn(`Skipping navigation menu item "${item.name ?? item.id}": target record not found for record ${item.targetRecordId}`);
        continue;
      }

      itemsToCreate.push({
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
      });
      resolvedInWave.push(item);
    }

    if (itemsToCreate.length > 0) {
      await executeWithRetry(() => createManyMetadataEntities(targetWorkspace, 'createManyNavigationMenuItems', 'inputs', 'CreateNavigationMenuItemInput', itemsToCreate));
      createdCount += itemsToCreate.length;
    }
    for (const item of resolvedInWave) {
      itemQueue.enqueueChildrenOf(item);
    }

    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  if (processedCount < itemsToProcess.length) {
    logger.warn(`Skipping ${itemsToProcess.length - processedCount} navigation menu item(s): unresolved folder chain`);
  }

  setStateRef('migratedNavigationMenuItems', true);
  logger.log(`Navigation menu items: created ${createdCount}`);
  return true;
};