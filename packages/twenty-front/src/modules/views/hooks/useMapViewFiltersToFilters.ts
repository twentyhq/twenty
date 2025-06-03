import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { ViewFilter } from '../types/ViewFilter';
import { mapViewFiltersToFilters } from '../utils/mapViewFiltersToFilters';
import { useVectorSearchField } from './useVectorSearchField';

export const useMapViewFiltersToFilters = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();
  const { vectorSearchField } = useVectorSearchField();

  const mapViewFiltersToRecordFilters = (viewFilters: ViewFilter[]) => {
    const allFieldMetadataItems = [
      ...filterableFieldMetadataItems,
      ...(vectorSearchField ? [vectorSearchField] : []),
    ];

    return mapViewFiltersToFilters(viewFilters, allFieldMetadataItems);
  };

  return { mapViewFiltersToRecordFilters };
};
