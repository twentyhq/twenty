import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

export const getQueryVariablesFromFiltersAndSorts = ({
  recordFilterGroups,
  recordFilters,
  recordSorts,
  objectMetadataItem,
  filterValueDependencies,
}: {
  recordFilterGroups: RecordFilterGroup[];
  recordFilters: RecordFilter[];
  recordSorts: RecordSort[];
  objectMetadataItem: ObjectMetadataItem;
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
  const filter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem?.fields ?? [],
    filterValueDependencies,
    recordFilterGroups,
    recordFilters,
  });

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, recordSorts);

  return {
    filter,
    orderBy,
  };
};
