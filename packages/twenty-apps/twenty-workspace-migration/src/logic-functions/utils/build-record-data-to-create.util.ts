import { RecordIdResolution, resolveTargetRecordId } from "src/logic-functions/utils/record-id-resolution.util";

export type DroppedRelationCounts = Map<string, number>;

export const buildRecordDataToCreate = (
  node: Record<string, unknown>,
  dataKeys: string[],
  relationForeignKeyNames: ReadonlySet<string>,
  recordIds: RecordIdResolution,
  // Counting dropped keys and reporting once per page keeps a systematically unresolvable
  // relation from emitting one warning per record across a whole object's worth of them.
  droppedRelationCounts?: DroppedRelationCounts,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  for (const key of dataKeys) {
    if (relationForeignKeyNames.has(key)) {
      const sourceRecordId = node[key];
      // Narrowed rather than asserted: the key is discovered at runtime, so this is the only
      // point that establishes the value really is a record id.
      if (typeof sourceRecordId !== 'string') {
        data[key] = null;
        continue;
      }
      const targetRecordId = resolveTargetRecordId(recordIds, sourceRecordId);
      if (targetRecordId === undefined) {
        droppedRelationCounts?.set(key, (droppedRelationCounts.get(key) ?? 0) + 1);
        continue;
      }
      data[key] = targetRecordId;
      continue;
    }
    data[key] = node[key];
  }

  return data;
};
