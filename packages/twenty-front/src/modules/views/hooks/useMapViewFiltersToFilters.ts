import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ViewFilter as GqlViewFilter } from '~/generated-metadata/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useMapViewFiltersToFilters = () => {
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const mapViewFiltersToRecordFilters = (
    viewFilters: ViewFilter[] | GqlViewFilter[],
  ) => {
    return mapViewFiltersToFilters(viewFilters, flattenedFieldMetadataItems);
  };

  return { mapViewFiltersToRecordFilters };
};
