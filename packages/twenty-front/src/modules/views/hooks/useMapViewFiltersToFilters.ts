import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type ViewFilter as GqlViewFilter } from '~/generated-metadata/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useMapViewFiltersToFilters = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const mapViewFiltersToRecordFilters = (
    viewFilters: ViewFilter[] | GqlViewFilter[],
  ) => {
    const filterableFieldMetadataItems =
      getFilterableFields(objectMetadataItem);
    return mapViewFiltersToFilters(viewFilters, filterableFieldMetadataItems);
  };

  return { mapViewFiltersToRecordFilters };
};
