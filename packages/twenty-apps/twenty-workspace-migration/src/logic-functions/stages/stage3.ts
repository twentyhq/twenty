import {
  migrationState,
  saveMigrationStateCheckpoint,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { type AxiosInstance } from "axios";
import { migrateRecordsForObject } from "src/logic-functions/migration/migrate-records-for-object.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const stage3 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const recordIdMap = migrationState.recordIdMap;
  const targetWorkspaceObjects = migrationState.targetWorkspaceObjects;
  const recordMigrationOrder = migrationState.recordMigrationOrder;
  const targetObjectIdByNameSingular = new Map(
    targetWorkspaceObjects.map((obj) => [obj.nameSingular, obj.id]),
  );

  for (const sourceObject of recordMigrationOrder) {
    const targetObjectId = targetObjectIdByNameSingular.get(sourceObject.nameSingular);
    if (targetObjectId === undefined) {
      logger.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, recordIdMap);
    setStateRef('recordMigrationOrder', recordMigrationOrder.slice(recordMigrationOrder.indexOf(sourceObject)));
  }
  setStateRef('stage', 4);
  await saveMigrationStateCheckpoint();
}