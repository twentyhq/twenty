import { AxiosInstance } from "axios";
import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { migrateRecordPageLayouts } from "src/logic-functions/migration/migrate-page-record-layouts.util";

export const stage6 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  if (await migrateRecordPageLayouts(
    sourceWorkspace,
    targetWorkspace,
    migrationState.targetObjectIdBySourceObjectId,
    migrationState.targetFieldIdBySourceFieldId,
    migrationState.targetPageLayoutIdBySourcePageLayoutId)) {
    setStateRef('stage', 7);
    await saveMigrationStateCheckpointAndStop();
  }
}
