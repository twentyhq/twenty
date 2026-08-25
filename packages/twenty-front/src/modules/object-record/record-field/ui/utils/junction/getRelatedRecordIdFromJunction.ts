import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import {
  computeRelationGqlFieldJoinColumnName,
  isNonEmptyString,
} from 'twenty-shared/utils';

export const getRelatedRecordIdFromJunction = ({
  junctionRecord,
  relationFieldName,
}: {
  junctionRecord: object;
  relationFieldName: string;
}): string | undefined => {
  const joinColumnName = computeRelationGqlFieldJoinColumnName({
    name: relationFieldName,
  });
  const joinColumnValue = (junctionRecord as Record<string, unknown>)[
    joinColumnName
  ];

  if (isNonEmptyString(joinColumnValue)) {
    return joinColumnValue;
  }

  return getRelatedRecordFromJunction(junctionRecord, relationFieldName)?.id;
};
