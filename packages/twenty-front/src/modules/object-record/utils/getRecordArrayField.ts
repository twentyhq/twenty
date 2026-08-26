import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordFieldValue } from '@/object-record/utils/getRecordFieldValue';

export const getRecordArrayField = ({
  record,
  fieldName,
}: {
  record: object | null | undefined;
  fieldName: string;
}): ObjectRecord[] => {
  const fieldValue = getRecordFieldValue({ record, fieldName });

  return Array.isArray(fieldValue) ? fieldValue.filter(isObjectWithId) : [];
};
