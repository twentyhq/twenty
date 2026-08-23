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
  const recordMigrationOrder = buildRecordMigrationOrder(migrationState.sourceWorkspaceObjects);
  const targetObjectIdByNameSingular = new Map(
    targetWorkspaceObjects.map((obj) => [obj.nameSingular, obj.id]),
  );

  for (const [index, sourceObject] of recordMigrationOrder.entries()) {
    if (index < migrationState.recordMigrationIndex) {
      continue;
    }
    const targetObjectId = targetObjectIdByNameSingular.get(sourceObject.nameSingular);
    if (targetObjectId === undefined) {
      logger.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    if (await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, recordIds)) {
      return;
    }
    setStateRef('recordMigrationIndex', index + 1);
  }

  // Runs only once every record exists, so foreign keys dropped at insert time for pointing at
  // a record that hadn't been created yet (self-references, broken dependency cycles) can be
  // written back.
  const reconciled = await reconcileDeferredRelations(
    sourceWorkspace,
    targetWorkspace,
    recordMigrationOrder,
    recordIds,
  );
  if (reconciled === false) {
    return;
  }

  setStateRef('sourceWorkspaceObjects', []);
  setStateRef('targetWorkspaceObjects', []);
  // Nothing past this stage reads the schema snapshots, and they are the largest thing in the
  // checkpoint - dropping them keeps every later checkpoint small.
  setStateRef('sourceWorkspaceObjects', []);
  setStateRef('targetWorkspaceObjects', []);
  setStateRef('stage', 4);
  await saveMigrationStateCheckpointAndStop();
}