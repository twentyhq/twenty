import { isNonEmptyString } from '@sniptt/guards';

import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import { safeGetNestedProperty } from 'twenty-shared/utils';

export const getRelatedRecordIdFromJunction = ({
  junctionRecord,
  relationFieldName,
  joinColumnName,
}: {
  junctionRecord: object;
  relationFieldName: string;
  joinColumnName: string;
}): string | undefined => {
  const joinColumnValue = safeGetNestedProperty(junctionRecord, joinColumnName);

  return isNonEmptyString(joinColumnValue)
    ? joinColumnValue
    : getRelatedRecordFromJunction({
        junctionRecord,
        relationFieldName,
      })?.id;
};
