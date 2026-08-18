import { AxiosInstance } from "axios";
import {
  loadMigrationStateCheckpoint,
  migrationState,
  setMigrationStage
} from "src/logic-functions/utils/migration-state.util";
import { migrateRecordPageLayouts } from "src/logic-functions/migration/migrate-page-record-layouts.util";

export const stage6 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {


  await loadMigrationStateCheckpoint();
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;

  await migrateRecordPageLayouts(sourceWorkspace, targetWorkspace, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);
  await setMigrationStage(7);
}