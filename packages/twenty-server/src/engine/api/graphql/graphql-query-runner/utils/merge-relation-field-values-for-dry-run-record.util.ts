import { type ObjectRecord, RelationType } from 'twenty-shared/types';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { selectPriorityFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/select-priority-field-value.util';

export const mergeRelationFieldValuesForDryRunRecord = (
  recordsWithValues: { value: unknown; recordId: string }[],
  relationType: RelationType | undefined,
  priorityRecordId: string,
): ObjectRecord | ObjectRecord[] | null => {
  if (relationType === RelationType.ONE_TO_MANY) {
    return mergeOneToManyRelationArrays(recordsWithValues);
  }

  return selectPriorityFieldValue(
    recordsWithValues as { value: ObjectRecord | null; recordId: string }[],
    priorityRecordId,
  );
};

const mergeOneToManyRelationArrays = (
  recordsWithValues: { value: unknown; recordId: string }[],
): ObjectRecord[] => {
  const allRelations: ObjectRecord[] = [];

  recordsWithValues.forEach(({ value }) => {
    if (Array.isArray(value)) {
      value.forEach((relation: ObjectRecord) => {
        if (relation?.id && hasRecordFieldValue(relation)) {
          allRelations.push(relation);
        }
      });
    }
  });

  const uniqueRelationsMap = new Map<string, ObjectRecord>();

  allRelations.forEach((relation) => {
    if (relation.id && !uniqueRelationsMap.has(relation.id)) {
      uniqueRelationsMap.set(relation.id, relation);
    }
  });

  return Array.from(uniqueRelationsMap.values());
};
