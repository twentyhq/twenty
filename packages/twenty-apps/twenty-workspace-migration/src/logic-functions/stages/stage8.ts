import { type AxiosInstance } from "axios";
import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { migrateAttachments } from "src/logic-functions/migration/migrate-attachments.util";

export const stage8 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  await migrateAttachments(sourceWorkspace, targetWorkspace, migrationState.recordIdMap);
}
