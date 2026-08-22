import { type AxiosInstance } from "axios";
import {
  saveMigrationStateCheckpoint,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { buildRecordIdResolution } from "src/logic-functions/utils/record-id-resolution.util";
import { migrateAttachments } from "src/logic-functions/migration/migrate-attachments.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const stage8 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  if (await migrateAttachments(sourceWorkspace, targetWorkspace, buildRecordIdResolution()) === false) {
    return;
  }
  setStateRef('stage', 9);
  await saveMigrationStateCheckpoint();
  logger.log('Migration complete');
}
