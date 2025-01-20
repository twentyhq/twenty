import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemsAsFilterDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';

import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from '~/utils/isDefined';

export const getQueryVariablesFromView = ({
  view,
  fieldMetadataItems,
  objectMetadataItem,
  isJsonFilterEnabled,
  filterValueDependencies,
}: {
  view: View | null | undefined;
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  isJsonFilterEnabled: boolean;
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
  if (!isDefined(view)) {
    return {
      filter: undefined,
      orderBy: undefined,
    };
  }

  const { viewFilterGroups, viewFilters, viewSorts } = view;

  const filterDefinitions = formatFieldMetadataItemsAsFilterDefinitions({
    fields: fieldMetadataItems,
    isJsonFilterEnabled,
  });

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: fieldMetadataItems,
  });

  const filter = computeViewRecordGqlOperationFilter(
    filterValueDependencies,
    mapViewFiltersToFilters(viewFilters, filterDefinitions),
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
