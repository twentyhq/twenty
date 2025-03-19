import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';

import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { View } from '@/views/types/View';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from 'twenty-shared';

export const getQueryVariablesFromView = ({
  view,
  fieldMetadataItems,
  objectMetadataItem,
  filterValueDependencies,
}: {
  view: View | null | undefined;
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
  if (!isDefined(view)) {
    return {
      filter: undefined,
      orderBy: undefined,
    };
  }

  const { viewFilterGroups, viewFilters, viewSorts } = view;

  const recordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
    viewFilterGroups ?? [],
  );

  const recordFilters = mapViewFiltersToFilters(
    viewFilters,
    fieldMetadataItems,
  );

  const filter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem?.fields ?? [],
    filterValueDependencies,
    recordFilterGroups,
    recordFilters,
  });

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    mapViewSortsToSorts(viewSorts),
  );

  return {
    filter,
    orderBy,
  };
};
