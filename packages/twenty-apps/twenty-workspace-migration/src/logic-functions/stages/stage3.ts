import {
  loadMigrationStateCheckpoint,
  migrationState,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { type AxiosInstance } from "axios";
import { migrateRecordsForObject } from "src/logic-functions/migration/migrate-records-for-object.util";
import { estimateMigrationDuration } from "src/logic-functions/utils/estimate-migration-duration.util";

export const stage3 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  await loadMigrationStateCheckpoint();

  const mergedWorkspaceMembers = migrationState.mergedWorkspaceMembers;
  const targetWorkspaceObjects = migrationState.targetWorkspaceObjects;
  const recordMigrationOrder = migrationState.recordMigrationOrder;

  const { estimatedMinutes, batchableRecordCount, otherRecordCount } = await estimateMigrationDuration(
    sourceWorkspace,
    recordMigrationOrder,
  );
  console.log(`Estimated migration time: ~${estimatedMinutes} minute(s) worst case (${batchableRecordCount} record(s) via createManyRecords, ${otherRecordCount} attachment(s))`);

  const recordIdMap = new Map<string, string>(
    mergedWorkspaceMembers.map((member) => [member.oldId, member.newId]),
  );
  setStateRef('recordIdMap', recordIdMap);
  const targetObjectIdByNameSingular = new Map(
    targetWorkspaceObjects.map((obj) => [obj.nameSingular, obj.id]),
  );

  for (const sourceObject of recordMigrationOrder) {
    if (stopIfTimeBudgetExceeded()) {
      return;
    }
    const targetObjectId = targetObjectIdByNameSingular.get(sourceObject.nameSingular);
    if (targetObjectId === undefined) {
      console.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, recordIdMap);
  }
  setStateRef('stage', 4);
}