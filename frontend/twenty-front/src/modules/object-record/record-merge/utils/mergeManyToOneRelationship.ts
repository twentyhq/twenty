import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const mergeManyToOneRelationship = (
  records: ObjectRecord[],
  fieldName: string,
): ObjectRecord | null => {
  const firstNonNullValue = records
    .map((record) => record[fieldName])
    .find((value) => isDefined(value) && value !== null);

  return firstNonNullValue || null;
};
