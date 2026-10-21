import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const assignManyToOneRelationRecords = ({
  parentRecords,
  relationRecords,
  sourceFieldName,
  parentRecordJoinColumnName,
  selectedFields,
}: {
  parentRecords: ObjectRecord[];
  relationRecords: ObjectRecord[];
  sourceFieldName: string;
  parentRecordJoinColumnName: string;
  selectedFields: Record<string, unknown>;
}): void => {
  const relationRecordById = new Map<unknown, ObjectRecord>();

  for (const relationRecord of relationRecords) {
    if (relationRecordById.has(relationRecord.id)) {
      continue;
    }

    relationRecordById.set(relationRecord.id, relationRecord);
  }

  for (const parentRecord of parentRecords) {
    const matchedRelation = relationRecordById.get(
      parentRecord[parentRecordJoinColumnName],
    );

    if (!isDefined(matchedRelation)) {
      parentRecord[sourceFieldName] = null;

      continue;
    }

    if (isDefined(matchedRelation.deletedAt)) {
      parentRecord[sourceFieldName] = null;
      parentRecord[parentRecordJoinColumnName] = null;

      continue;
    }

    if (selectedFields?.deletedAt === true) {
      parentRecord[sourceFieldName] = matchedRelation;

      continue;
    }

    const { deletedAt: _, ...relationWithoutDeletedAt } = matchedRelation;

    parentRecord[sourceFieldName] = relationWithoutDeletedAt;
  }
};
