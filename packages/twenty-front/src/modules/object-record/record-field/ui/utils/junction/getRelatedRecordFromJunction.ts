import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordFieldValue } from '@/object-record/utils/getRecordFieldValue';

export const getRelatedRecordFromJunction = ({
  junctionRecord,
  relationFieldName,
}: {
  junctionRecord: object;
  relationFieldName: string;
}): ObjectRecord | undefined => {
  const relatedRecord = getRecordFieldValue({
    record: junctionRecord,
    fieldName: relationFieldName,
  });

  return isObjectWithId(relatedRecord) ? relatedRecord : undefined;
};
