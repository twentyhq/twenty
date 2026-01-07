import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type CoreViewFilter } from '~/generated/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useMapViewFiltersToFilters = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const mapViewFiltersToRecordFilters = (
    viewFilters: ViewFilter[] | CoreViewFilter[],
  ) => {
    const filterableFieldMetadataItems =
      getFilterableFields(objectMetadataItem);
    return mapViewFiltersToFilters(viewFilters, filterableFieldMetadataItems);
  };

  return { mapViewFiltersToRecordFilters };
};
