import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ViewFilter as GqlViewFilter } from '~/generated-metadata/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useMapViewFiltersToFilters = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const mapViewFiltersToRecordFilters = (
    viewFilters: ViewFilter[] | GqlViewFilter[],
  ) => {
    const filterableFieldMetadataItems =
      getFilterableFields(objectMetadataItem);
    return mapViewFiltersToFilters(
      viewFilters,
      filterableFieldMetadataItems,
      flattenedFieldMetadataItems,
    );
  };

  return { mapViewFiltersToRecordFilters };
};
