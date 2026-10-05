import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const collectFilterFieldNames = (
  filter: Partial<ObjectRecordFilter>,
): string[] =>
  Object.entries(filter).flatMap(([filterKey, filterValue]) => {
    if (filterKey !== 'and' && filterKey !== 'or' && filterKey !== 'not') {
      return [filterKey];
    }

    const subFilters = (
      Array.isArray(filterValue) ? filterValue : [filterValue]
    ) as Partial<ObjectRecordFilter>[];

    return subFilters.flatMap(collectFilterFieldNames);
  });
