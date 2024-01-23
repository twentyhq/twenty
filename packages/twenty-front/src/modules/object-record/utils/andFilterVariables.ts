import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { isDefined } from '~/utils/isDefined';

export const andFilterVariables = (
  filters: (ObjectRecordQueryFilter | undefined)[],
): ObjectRecordQueryFilter | undefined => {
  const definedFilters = filters.filter(isDefined);

  if (!definedFilters.length) return undefined;

  return definedFilters.length === 1
    ? definedFilters[0]
    : { and: definedFilters };
};
