import {
  migrationState,
  saveMigrationStateCheckpoint,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { migrateDashboards } from "src/logic-functions/migration/migrate-dashboards.util";
import { AxiosInstance } from "axios";

export const stage5 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;

  await migrateDashboards(sourceWorkspace, targetWorkspace, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);
  setStateRef('stage', 6);
  await saveMigrationStateCheckpoint();
}