import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';

export const assignManyToOneRelationRecords = ({
  parentRecords,
  relationRecords,
  sourceFieldName,
  parentRecordJoinColumnName,
  selectedColumns,
}: {
  parentRecords: ObjectRecord[];
  relationRecords: ObjectRecord[];
  sourceFieldName: string;
  parentRecordJoinColumnName: string;
  selectedColumns: CommonSelection['columns'];
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

    if (selectedColumns.deletedAt) {
      parentRecord[sourceFieldName] = matchedRelation;

      continue;
    }

    const { deletedAt: _, ...relationWithoutDeletedAt } = matchedRelation;

    parentRecord[sourceFieldName] = relationWithoutDeletedAt;
  }
};
