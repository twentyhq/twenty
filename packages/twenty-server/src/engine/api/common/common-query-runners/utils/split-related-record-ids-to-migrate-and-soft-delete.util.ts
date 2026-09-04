import { type ObjectRecord } from 'twenty-shared/types';

import { computeDuplicateKeys } from 'src/engine/api/common/common-query-runners/utils/compute-duplicate-keys.util';

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
    relatedRecordsOfPriorityRecord.flatMap((record) =>
      computeDuplicateKeys({ record, duplicateKeyColumnGroups }),
    ),
  );

  const idsToMigrate: string[] = [];
  const idsToSoftDelete: string[] = [];

  for (const record of relatedRecordsOfRecordsToDelete) {
    const duplicateKeys = computeDuplicateKeys({
      record,
      duplicateKeyColumnGroups,
    });

    if (
      duplicateKeys.some((duplicateKey) => takenDuplicateKeys.has(duplicateKey))
    ) {
      idsToSoftDelete.push(record.id);
      continue;
    }

    duplicateKeys.forEach((duplicateKey) =>
      takenDuplicateKeys.add(duplicateKey),
    );
    idsToMigrate.push(record.id);
  }

  return { idsToMigrate, idsToSoftDelete };
};
