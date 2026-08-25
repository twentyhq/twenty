import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type RecordFilter = Partial<ObjectRecordFilter>;

// A filter is empty when it produces no WHERE predicate, so a bulk mutation
// using it would target every record of the object. That covers not only `{}`
// but logical operators that recurse to nothing: `{ and: [] }`, `{ or: [] }`,
// `{ not: {} }`, `{ and: [{}] }`, matching how the query parser walks them.
export const isRecordFilterEmpty = (filter: RecordFilter): boolean => {
  const filterEntries = Object.entries(filter);

  if (filterEntries.length === 0) {
    return true;
  }

  return filterEntries.every(([filterKey, filterValue]) => {
    if (filterKey === 'and' || filterKey === 'or') {
      const subFilters = isDefined(filterValue)
        ? (filterValue as RecordFilter[])
        : [];

      return subFilters.every(isRecordFilterEmpty);
    }

    if (filterKey === 'not') {
      return isRecordFilterEmpty(
        isDefined(filterValue) ? (filterValue as RecordFilter) : {},
      );
    }

    return false;
  });
};
