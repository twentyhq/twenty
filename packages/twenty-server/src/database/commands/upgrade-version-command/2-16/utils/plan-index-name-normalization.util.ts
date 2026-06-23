// The deterministic index name embeds the table name, columns, uniqueness and
// where clause. Indexes created before the v2 naming convention (pre-2025-09-23)
// kept their old name in metadata, which no longer matches the recomputed name.
// Code paths that match an index by recomputing its expected name (e.g. dropping
// the backing unique index when toggling isUnique off) then silently no-op.
//
// This util takes each index's current vs expected name and produces the
// operations needed to normalize them. Two indexes that resolve to the SAME
// expected name are duplicates (identical table + columns + uniqueness + where),
// so only one can survive — the rest are redundant and must be dropped.

export type FlatIndexNameStatus = {
  indexMetadataId: string;
  objectMetadataId: string;
  currentName: string;
  expectedName: string;
};

export type RenameIndexNameOperation = {
  type: 'rename';
  indexMetadataId: string;
  objectMetadataId: string;
  fromName: string;
  toName: string;
};

export type DropRedundantIndexOperation = {
  type: 'dropRedundant';
  indexMetadataId: string;
  objectMetadataId: string;
  redundantName: string;
  keptName: string;
};

export type IndexNameNormalizationOperation =
  | RenameIndexNameOperation
  | DropRedundantIndexOperation;

export const planIndexNameNormalization = (
  indexStatuses: FlatIndexNameStatus[],
): IndexNameNormalizationOperation[] => {
  const operations: IndexNameNormalizationOperation[] = [];

  const statusesByExpectedName = new Map<string, FlatIndexNameStatus[]>();

  for (const status of indexStatuses) {
    const group = statusesByExpectedName.get(status.expectedName) ?? [];

    group.push(status);
    statusesByExpectedName.set(status.expectedName, group);
  }

  for (const [expectedName, group] of statusesByExpectedName) {
    // Prefer an index already at the correct name as the survivor so we avoid
    // an unnecessary rename; otherwise keep the first and rename it.
    const survivor =
      group.find((status) => status.currentName === expectedName) ?? group[0];

    if (survivor.currentName !== expectedName) {
      operations.push({
        type: 'rename',
        indexMetadataId: survivor.indexMetadataId,
        objectMetadataId: survivor.objectMetadataId,
        fromName: survivor.currentName,
        toName: expectedName,
      });
    }

    for (const status of group) {
      if (status === survivor) {
        continue;
      }

      operations.push({
        type: 'dropRedundant',
        indexMetadataId: status.indexMetadataId,
        objectMetadataId: status.objectMetadataId,
        redundantName: status.currentName,
        keptName: expectedName,
      });
    }
  }

  return operations;
};
