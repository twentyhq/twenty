import type { AxiosInstance } from "axios";
import { findPageLayouts } from "src/logic-functions/requests/find-page-layouts.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { applyPageLayoutTabsAndWidgets } from "src/logic-functions/utils/apply-page-layout-tabs-and-widgets.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const migrateRecordPageLayouts = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const sourcePageLayouts = await findPageLayouts(sourceWorkspace, 'RECORD_PAGE');
  const targetPageLayouts = await findPageLayouts(targetWorkspace, 'RECORD_PAGE');

  // Every object gets an auto-provisioned system RECORD_PAGE layout for free the moment the
  // object itself is created (a side effect of createOneObject, not something this stage
  // does) - only non-system layouts represent actual customization worth migrating.
  const customSourcePageLayouts = sourcePageLayouts.filter((layout) => !layout.isSystemSideEffect);
  // Dedup key: unlike Dashboard, there's no sibling record with a client-settable id to anchor
  // idempotency on here, so this falls back to (target object, name) - not a database-enforced
  // unique constraint, but the best available signal without one.
  const existingTargetLayoutKeys = new Set(
    targetPageLayouts
    .filter((layout) => !layout.isSystemSideEffect)
    .map((layout) => `${layout.objectMetadataId}::${layout.name}`),
  );

  let createdCount = 0;

  for (const sourceLayout of customSourcePageLayouts) {
    const targetObjectMetadataId = sourceLayout.objectMetadataId !== null
      ? targetObjectIdBySourceObjectId.get(sourceLayout.objectMetadataId)
      : undefined;
    if (targetObjectMetadataId === undefined) {
      logger.warn(`Skipping record page layout "${sourceLayout.name}": target object not found for object ${sourceLayout.objectMetadataId}`);
      continue;
    }

    if (existingTargetLayoutKeys.has(`${targetObjectMetadataId}::${sourceLayout.name}`)) {
      continue;
    }

    try {
      const createdPageLayout = await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createPageLayout', 'input', 'CreatePageLayoutInput', {
        name: sourceLayout.name,
        type: sourceLayout.type,
        objectMetadataId: targetObjectMetadataId,
      }));

      await applyPageLayoutTabsAndWidgets(
        targetWorkspace,
        createdPageLayout.id,
        sourceLayout.tabs,
        targetObjectIdBySourceObjectId,
        targetFieldIdBySourceFieldId,
        `record page layout "${sourceLayout.name}"`,
      );
      createdCount += 1;
    } catch (error) {
      logger.warn(`Skipping record page layout "${sourceLayout.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logger.log(`Record page layouts: created ${createdCount}`);
};