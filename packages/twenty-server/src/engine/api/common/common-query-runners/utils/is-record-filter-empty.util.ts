import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type RecordFilter = Partial<ObjectRecordFilter>;

export const isRecordFilterEmpty = (filter: RecordFilter): boolean => {
  const filterEntries = Object.entries(filter);

  if (filterEntries.length === 0) {
    return true;
  }

  return filterEntries.every(([filterKey, filterValue]) => {
    if (filterKey === 'and' || filterKey === 'or') {
      const subFilters: RecordFilter[] = isDefined(filterValue)
        ? filterValue
        : [];

      return subFilters.every(isRecordFilterEmpty);
    }

    if (filterKey === 'not') {
      const negatedFilter: RecordFilter = isDefined(filterValue)
        ? filterValue
        : {};

      return isRecordFilterEmpty(negatedFilter);
    }

    return false;
  });
};
