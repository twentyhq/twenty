import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  type FindFieldMetadataItemById,
} from 'twenty-shared/utils';

export const getQueryVariablesFromFiltersAndSorts = ({
  recordFilterGroups,
  recordFilters,
  recordSorts,
  objectMetadataItem,
  objectMetadataItems = [],
  findFieldMetadataItemById,
  filterValueDependencies,
}: {
  recordFilterGroups: RecordFilterGroup[];
  recordFilters: RecordFilter[];
  recordSorts: RecordSort[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
  findFieldMetadataItemById: FindFieldMetadataItemById;
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
  const filter = computeRecordGqlOperationFilter({
    findFieldMetadataItemById,
    filterValueDependencies,
    recordFilterGroups,
    recordFilters,
  });

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    recordSorts,
    objectMetadataItems,
  );

  return {
    filter,
    orderBy,
  };
};
