import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const AdvancedFilterDropdownContent = () => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();
  const viewFilters = currentViewWithCombinedFiltersAndSorts?.viewFilters;
  // const viewFilterGroups = currentViewWithCombinedFiltersAndSorts?.viewFilterGroups;

  return <div className="flex flex-col gap-2"></div>;
};
