import { RecordIdResolution } from "src/logic-functions/utils/record-id-resolution.util";

// Most tests only care that a given source id resolves, which under the identity scheme means
// "is in the migrated set". Pass workspaceMembers for the one case where the id actually changes.
export const buildTestRecordIds = (
  migratedRecordIds: string[] = [],
  workspaceMembers: [string, string][] = [],
): RecordIdResolution => ({
  workspaceMemberIdMap: new Map(workspaceMembers),
  migratedRecordIds: new Set(migratedRecordIds),
});
