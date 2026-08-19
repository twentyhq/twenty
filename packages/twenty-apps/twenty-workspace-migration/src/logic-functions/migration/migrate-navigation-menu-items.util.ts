import type { AxiosInstance } from "axios";
import { findNavigationMenuItems } from "src/logic-functions/requests/find-navigation-menu-items.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const migrateNavigationMenuItems = async (
  targetWorkspace: AxiosInstance,
  sourceItems: Awaited<ReturnType<typeof findNavigationMenuItems>>,
  targetItems: Awaited<ReturnType<typeof findNavigationMenuItems>>,
  targetObjectIdBySourceObjectId: Map<string, string>,
  recordIdMap: Map<string, string>,
) => {
  // Folders can be parents of other items, so an item is only attempted once its folder (if
  // any) is already resolved in the target. Items skipped for any reason (personal, page
  // layout, unresolved target) are never marked resolved, so anything nested under them is
  // correctly left unresolved too, rather than pointing at a folder that was never created.
  const resolvedItemIds = new Set(targetItems.map((item) => item.id));
  const remainingItems = [...sourceItems];
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
      if (item.pageLayoutId !== null) {
        logger.warn(`Skipping navigation menu item "${item.name ?? item.id}": page layouts aren't migrated by this tool`);
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

      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createNavigationMenuItem', 'input', 'CreateNavigationMenuItemInput', {
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
        position: item.position,
      }));
      resolvedItemIds.add(item.id);
      createdCount += 1;
    }
  }

  logger.log(`Navigation menu items: created ${createdCount}`);
};