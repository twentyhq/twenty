import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';

import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { View } from '@/views/types/View';
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

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: fieldMetadataItems,
  });

  const filter = computeViewRecordGqlOperationFilter(
    filterValueDependencies,
    mapViewFiltersToFilters(viewFilters, fieldMetadataItems),
    objectMetadataItem?.fields ?? [],
    viewFilterGroups ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    mapViewSortsToSorts(viewSorts, sortDefinitions),
  );

  return {
    filter,
    orderBy,
  };
};
