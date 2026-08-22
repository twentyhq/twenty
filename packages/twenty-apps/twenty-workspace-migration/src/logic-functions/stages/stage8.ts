import { type AxiosInstance } from "axios";
import {
  migrationState,
  saveMigrationStateCheckpoint,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { migrateAttachments } from "src/logic-functions/migration/migrate-attachments.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const stage8 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  if (await migrateAttachments(sourceWorkspace, targetWorkspace, migrationState.recordIdMap) === false) {
    return;
  }
  setStateRef('stage', 9);
  await saveMigrationStateCheckpoint();
  logger.log('Migration complete');
}
