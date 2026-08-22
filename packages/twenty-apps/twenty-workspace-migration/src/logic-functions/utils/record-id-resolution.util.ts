import { migrationState } from "src/logic-functions/utils/migration-state.util";

// Records keep their source id in the target, because `id` is a real UUID field on every object
// and so rides along in every create payload. That makes a source-to-target id map pure
// identity for everything except workspace members, which are matched by email against members
// the target workspace already has. Storing those identity pairs would double the size of every
// checkpoint for no information, so migrated records are tracked as a plain set of ids instead.
export type RecordIdResolution = {
  workspaceMemberIdMap: Map<string, string>;
  migratedRecordIds: Set<string>;
};

// undefined means "not migrated, so nothing in the target can reference it". Records are left
// out for several legitimate reasons - soft-deleted rows are excluded from every source query,
// some objects are never migrated at all, and dashboards and attachments only land in later
// stages - so callers use this to drop the reference rather than write a dangling one.
// Both halves live on migrationState and are mutated in place by the migrators, so this hands
// back live references rather than copies.
export const buildRecordIdResolution = (): RecordIdResolution => ({
  workspaceMemberIdMap: migrationState.workspaceMemberIdMap,
  migratedRecordIds: migrationState.migratedRecordIds,
});

export const resolveTargetRecordId = (
  { workspaceMemberIdMap, migratedRecordIds }: RecordIdResolution,
  sourceRecordId: string,
): string | undefined =>
  workspaceMemberIdMap.get(sourceRecordId)
  ?? (migratedRecordIds.has(sourceRecordId) ? sourceRecordId : undefined);
