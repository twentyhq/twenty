import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { safeGetNestedProperty } from 'twenty-shared/utils';

export const getJunctionRecordsFromRecord = ({
  record,
  junctionFieldName,
}: {
  record: object | null | undefined;
  junctionFieldName: string;
}): ObjectRecord[] => {
  const fieldValue = safeGetNestedProperty(record, junctionFieldName);

  return Array.isArray(fieldValue) ? fieldValue.filter(isObjectWithId) : [];
};
