import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useCurrentViewFilter = ({
  viewFilterId,
}: {
  viewFilterId?: string;
}) => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const viewFilter = currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
    (viewFilter) => viewFilter.id === viewFilterId,
  );

  if (!viewFilter) {
    return undefined;
  }

  const [filter] = mapViewFiltersToFilters(
    [viewFilter],
    filterableFieldMetadataItems,
  );

  return filter;
};
