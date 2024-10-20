import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const useCurrentViewViewFilterGroup = ({
  parentViewFilterGroupId,
}: {
  parentViewFilterGroupId?: string;
}) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const currentViewFilterGroup =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups.find(
      (viewFilterGroup) =>
        parentViewFilterGroupId
          ? viewFilterGroup.parentViewFilterGroupId === parentViewFilterGroupId
          : !viewFilterGroup.parentViewFilterGroupId,
    );

  if (!currentViewFilterGroup) {
    throw new Error('Current view filter group not found');
  }

  const childViewFilters =
    currentViewWithCombinedFiltersAndSorts?.viewFilters.filter(
      (viewFilter) =>
        viewFilter.viewFilterGroupId === currentViewFilterGroup.id,
    );

  const childViewFilterGroups =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups.filter(
      (viewFilterGroup) =>
        viewFilterGroup.parentViewFilterGroupId === currentViewFilterGroup.id,
    );

  const childViewFiltersAndViewFilterGroups = [
    ...(childViewFilterGroups ?? []),
    ...(childViewFilters ?? []),
  ].sort((a, b) => {
    const positionA = a.positionInViewFilterGroup ?? 0;
    const positionB = b.positionInViewFilterGroup ?? 0;
    return positionA - positionB;
  });

  return { currentViewFilterGroup, childViewFiltersAndViewFilterGroups };
};
