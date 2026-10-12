import { type ObjectRecord } from 'twenty-shared/types';

export const assignOneToManyRelationRecords = ({
  parentRecords,
  relationRecords,
  sourceFieldName,
  relatedRecordJoinColumnName,
}: {
  parentRecords: ObjectRecord[];
  relationRecords: ObjectRecord[];
  sourceFieldName: string;
  relatedRecordJoinColumnName: string;
}): void => {
  const relationRecordsByParentId = new Map<unknown, ObjectRecord[]>();

  for (const relationRecord of relationRecords) {
    const parentId = relationRecord[relatedRecordJoinColumnName];
    const records = relationRecordsByParentId.get(parentId) ?? [];

    records.push(relationRecord);
    relationRecordsByParentId.set(parentId, records);
  }

  for (const parentRecord of parentRecords) {
    parentRecord[sourceFieldName] = [
      ...(relationRecordsByParentId.get(parentRecord.id) ?? []),
    ];
  }
};
