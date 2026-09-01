import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const computeConflictKeys = ({
  relatedRecord,
  conflictingColumnGroups,
}: {
  relatedRecord: ObjectRecord;
  conflictingColumnGroups: string[][];
}): string[] =>
  conflictingColumnGroups
    .map((columns) => ({
      columns,
      values: columns.map((column) => relatedRecord[column]),
    }))
    .filter(({ values }) => values.every(isDefined))
    .map(({ columns, values }) => JSON.stringify([columns, values]));

export const splitRelatedRecordIdsToMigrate = ({
  relatedRecordsToMigrate,
  priorityRelatedRecords,
  conflictingColumnGroups,
}: {
  relatedRecordsToMigrate: ObjectRecord[];
  priorityRelatedRecords: ObjectRecord[];
  conflictingColumnGroups: string[][];
}): { idsToMigrate: string[]; idsToSoftDelete: string[] } => {
  const takenConflictKeys = new Set(
    priorityRelatedRecords.flatMap((relatedRecord) =>
      computeConflictKeys({ relatedRecord, conflictingColumnGroups }),
    ),
  );

  const idsToMigrate: string[] = [];
  const idsToSoftDelete: string[] = [];

  for (const relatedRecord of relatedRecordsToMigrate) {
    const conflictKeys = computeConflictKeys({
      relatedRecord,
      conflictingColumnGroups,
    });

    if (
      conflictKeys.some((conflictKey) => takenConflictKeys.has(conflictKey))
    ) {
      idsToSoftDelete.push(relatedRecord.id);
      continue;
    }

    conflictKeys.forEach((conflictKey) => takenConflictKeys.add(conflictKey));
    idsToMigrate.push(relatedRecord.id);
  }

  return { idsToMigrate, idsToSoftDelete };
};
