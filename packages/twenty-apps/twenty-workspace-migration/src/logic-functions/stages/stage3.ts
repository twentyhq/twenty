import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { type AxiosInstance } from "axios";
import { buildRecordIdResolution } from "src/logic-functions/utils/record-id-resolution.util";
import { migrateRecordsForObject } from "src/logic-functions/migration/migrate-records-for-object.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { reconcileDeferredRelations } from "src/logic-functions/migration/reconcile-deferred-relations.util";
import { buildRecordMigrationOrder } from "src/logic-functions/utils/build-record-migration-order.util";

export const stage3 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const recordIds = buildRecordIdResolution();
  const targetWorkspaceObjects = migrationState.targetWorkspaceObjects;
  const recordMigrationOrder = migrationState.recordMigrationOrder;
  const targetObjectIdByNameSingular = new Map(
    targetWorkspaceObjects.map((obj) => [obj.nameSingular, obj.id]),
  );

  for (const [index, sourceObject] of recordMigrationOrder.entries()) {
    const targetObjectId = targetObjectIdByNameSingular.get(sourceObject.nameSingular);
    if (targetObjectId === undefined) {
      logger.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    if (await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, recordIds)) {
      return;
    }
    setStateRef('recordMigrationOrder', recordMigrationOrder.slice(index + 1));
  }

  // Runs only once every record exists, so foreign keys dropped at insert time for pointing at
  // a record that hadn't been created yet (self-references, broken dependency cycles) can be
  // written back. Rebuilt from the source objects because the loop above drains the order.
  const reconciled = await reconcileDeferredRelations(
    sourceWorkspace,
    targetWorkspace,
    buildRecordMigrationOrder(migrationState.sourceWorkspaceObjects),
    recordIds,
  );
  if (reconciled === false) {
    return;
  }

  setStateRef('stage', 4);
  await saveMigrationStateCheckpointAndStop();
}