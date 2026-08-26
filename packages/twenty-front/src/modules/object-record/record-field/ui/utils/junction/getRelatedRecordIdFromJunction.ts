import { isNonEmptyString } from '@sniptt/guards';

import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import { getRecordFieldValue } from '@/object-record/utils/getRecordFieldValue';

export const getRelatedRecordIdFromJunction = ({
  junctionRecord,
  relationFieldName,
  joinColumnName,
}: {
  junctionRecord: object;
  relationFieldName: string;
  joinColumnName: string;
}): string | undefined => {
  const joinColumnValue = getRecordFieldValue({
    record: junctionRecord,
    fieldName: joinColumnName,
  });

  return isNonEmptyString(joinColumnValue)
    ? joinColumnValue
    : getRelatedRecordFromJunction({
        junctionRecord,
        relationFieldName,
      })?.id;
};
