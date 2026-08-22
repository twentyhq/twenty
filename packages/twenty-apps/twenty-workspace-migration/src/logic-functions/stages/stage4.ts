import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { findViews } from "src/logic-functions/requests/find-views.util";
import { type AxiosInstance } from "axios";
import { migrateViews } from "src/logic-functions/migration/migrate-views.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";

export const stage4 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;
  const sourceViews = await executeWithRetry(() => findViews(sourceWorkspace));
  const targetViews = await executeWithRetryAndCheckpoint(() => findViews(targetWorkspace));

  if (await migrateViews(targetWorkspace, sourceViews, targetViews, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId)) {
    setStateRef('stage', 5);
    await saveMigrationStateCheckpointAndStop();
  }
}
