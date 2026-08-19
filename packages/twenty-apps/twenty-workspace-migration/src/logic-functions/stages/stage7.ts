import { type AxiosInstance } from "axios";
import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { migrateAttachments } from "src/logic-functions/migration/migrate-attachments.util";

export const stage7 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  // Stage 9: migrate attachments. Runs after records (Stage 5) and dashboards (Stage 7) so
  // recordIdMap already covers every record type an attachment can point at - `attachment`
  // stays in objectsToOmitFromRecordMigration for exactly that reason (see src/constants/to-omit.ts).
  await migrateAttachments(sourceWorkspace, targetWorkspace, migrationState.recordIdMap);
}
