import { useFilterDefinitionsFromFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterDefinitionsFromFilterableFieldMetadataItems';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useCurrentViewFilter = ({
  viewFilterId,
}: {
  viewFilterId?: string;
}) => {
  const { filterDefinitions } =
    useFilterDefinitionsFromFilterableFieldMetadataItems();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const viewFilter = currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
    (viewFilter) => viewFilter.id === viewFilterId,
  );

  if (!viewFilter) {
    return undefined;
  }

  const [filter] = mapViewFiltersToFilters([viewFilter], filterDefinitions);

  return filter;
};
