import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
  objectMetadataItems = [],
  filterValueDependencies,
}: {
  recordFilterGroups: RecordFilterGroup[];
  recordFilters: RecordFilter[];
  recordSorts: RecordSort[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
  const fieldsAcrossObjects = objectMetadataItems.flatMap(
    (item) => item.fields,
  );
  const fieldsForFilter =
    fieldsAcrossObjects.length > 0
      ? fieldsAcrossObjects
      : (objectMetadataItem?.fields ?? []);

  const filter = computeRecordGqlOperationFilter({
    fields: fieldsForFilter,
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
