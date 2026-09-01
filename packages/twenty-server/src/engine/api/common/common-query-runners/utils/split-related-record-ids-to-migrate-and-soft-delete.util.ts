import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const computeDuplicateKeys = ({
  relatedRecord,
  duplicateKeyColumnGroups,
}: {
  relatedRecord: ObjectRecord;
  duplicateKeyColumnGroups: string[][];
}): string[] =>
  duplicateKeyColumnGroups
    .map((columns) => ({
      columns,
      values: columns.map((column) => relatedRecord[column]),
    }))
    .filter(({ values }) => values.every(isDefined))
    .map(({ columns, values }) => JSON.stringify([columns, values]));

export const splitRelatedRecordIdsToMigrateAndSoftDelete = ({
  relatedRecordsOfRecordsToDelete,
  relatedRecordsOfPriorityRecord,
  duplicateKeyColumnGroups,
}: {
  relatedRecordsOfRecordsToDelete: ObjectRecord[];
  relatedRecordsOfPriorityRecord: ObjectRecord[];
  duplicateKeyColumnGroups: string[][];
}): { idsToMigrate: string[]; idsToSoftDelete: string[] } => {
  const takenDuplicateKeys = new Set(
    relatedRecordsOfPriorityRecord.flatMap((relatedRecord) =>
      computeDuplicateKeys({ relatedRecord, duplicateKeyColumnGroups }),
    ),
  );

  const idsToMigrate: string[] = [];
  const idsToSoftDelete: string[] = [];

  for (const relatedRecord of relatedRecordsOfRecordsToDelete) {
    const duplicateKeys = computeDuplicateKeys({
      relatedRecord,
      duplicateKeyColumnGroups,
    });

    if (
      duplicateKeys.some((duplicateKey) => takenDuplicateKeys.has(duplicateKey))
    ) {
      idsToSoftDelete.push(relatedRecord.id);
      continue;
    }

    duplicateKeys.forEach((duplicateKey) =>
      takenDuplicateKeys.add(duplicateKey),
    );
    idsToMigrate.push(relatedRecord.id);
  }

  return { idsToMigrate, idsToSoftDelete };
};
