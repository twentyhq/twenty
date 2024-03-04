import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { isNonNullable } from '~/utils/isNonNullable';

export const makeAndFilterVariables = (
  filters: (ObjectRecordQueryFilter | undefined)[],
): ObjectRecordQueryFilter | undefined => {
  const definedFilters = filters.filter(isNonNullable);

  if (!definedFilters.length) return undefined;

  return definedFilters.length === 1
    ? definedFilters[0]
    : { and: definedFilters };
};
