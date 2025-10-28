import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type CoreViewFilter } from '~/generated/graphql';
import { type ViewFilter } from '../types/ViewFilter';
import { getFilterableFieldsWithVectorSearch } from '../utils/getFilterableFieldsWithVectorSearch';
import { mapViewFiltersToFilters } from '../utils/mapViewFiltersToFilters';

export const useMapViewFiltersToFilters = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const mapViewFiltersToRecordFilters = (
    viewFilters: ViewFilter[] | CoreViewFilter[],
  ) => {
    const filterableFieldMetadataItems =
      getFilterableFieldsWithVectorSearch(objectMetadataItem);
    return mapViewFiltersToFilters(viewFilters, filterableFieldMetadataItems);
  };

  return { mapViewFiltersToRecordFilters };
};
