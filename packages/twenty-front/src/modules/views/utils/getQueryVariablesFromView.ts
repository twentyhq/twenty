import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemsAsFilterDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from '~/utils/isDefined';

export const getQueryVariablesFromView = ({
  view,
  fieldMetadataItems,
  objectMetadataItem,
}: {
  view: View | null | undefined;
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (!isDefined(view)) {
    return {
      filter: undefined,
      orderBy: undefined,
    };
  }

  const { viewFilters, viewSorts } = view;

  const filterDefinitions = formatFieldMetadataItemsAsFilterDefinitions({
    fields: fieldMetadataItems,
  });

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: fieldMetadataItems,
  });

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    mapViewFiltersToFilters(viewFilters, filterDefinitions),
    objectMetadataItem?.fields ?? [],
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
