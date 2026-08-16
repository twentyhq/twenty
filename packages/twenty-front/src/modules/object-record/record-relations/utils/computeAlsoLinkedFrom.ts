// SOURCING: none — pure logic, no upstream component applies
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { extractConnectedRecords } from '@/object-record/record-relations/utils/extractConnectedRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AlsoLinkedFromHit = {
  recordId: string;
  sharedTargetIds: string[];
};

const relationTargetIds = (
  record: ObjectRecord,
  relationFields: FieldMetadataItem[],
): Set<string> => {
  const targets = new Set<string>();

  for (const field of relationFields) {
    for (const connected of extractConnectedRecords(record[field.name])) {
      if (connected.id !== record.id) {
        targets.add(connected.id);
      }
    }
  }

  return targets;
};

export const computeAlsoLinkedFrom = (
  records: ObjectRecord[],
  relationFields: FieldMetadataItem[],
): Map<string, AlsoLinkedFromHit[]> => {
  const targetsByRecordId = new Map(
    records.map((record) => [
      record.id,
      relationTargetIds(record, relationFields),
    ]),
  );

  const result = new Map<string, AlsoLinkedFromHit[]>();

  for (const record of records) {
    const mine = targetsByRecordId.get(record.id) ?? new Set<string>();
    const hits: AlsoLinkedFromHit[] = [];

    for (const other of records) {
      if (other.id === record.id) {
        continue;
      }

      const theirs = targetsByRecordId.get(other.id) ?? new Set<string>();
      const sharedTargetIds = [...mine].filter((id) => theirs.has(id));

      if (sharedTargetIds.length > 0) {
        hits.push({ recordId: other.id, sharedTargetIds });
      }
    }

    hits.sort(
      (left, right) =>
        right.sharedTargetIds.length - left.sharedTargetIds.length,
    );
    result.set(record.id, hits);
  }

  return result;
};
