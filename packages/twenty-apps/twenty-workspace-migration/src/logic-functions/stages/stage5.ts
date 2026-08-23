import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { buildRecordIdResolution } from "src/logic-functions/utils/record-id-resolution.util";
import { migrateDashboards } from "src/logic-functions/migration/migrate-dashboards.util";
import { AxiosInstance } from "axios";

export const stage5 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;
  const recordIds = buildRecordIdResolution();
  const targetPageLayoutIdBySourcePageLayoutId = migrationState.targetPageLayoutIdBySourcePageLayoutId;

  if (await migrateDashboards(sourceWorkspace, targetWorkspace, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, recordIds, targetPageLayoutIdBySourcePageLayoutId, migrationState.targetViewIdBySourceViewId)) {
    setStateRef('stage', 6);
    await saveMigrationStateCheckpointAndStop();
  }
}
