import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterGroup';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

interface AdvancedFilterDropdownButtonProps {
  viewBarId: string;
}

export const AdvancedFilterDropdownButton = (
  props: AdvancedFilterDropdownButtonProps,
) => {
  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const viewFilters =
    currentViewWithCombinedFiltersAndSorts?.viewFilters.filter(
      (viewFilter) => !!viewFilter.viewFilterGroupId,
    );
  const viewFilterGroups =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups;

  const viewFilterIds = viewFilters?.map((viewFilter) => viewFilter.id) ?? [];
  const viewFilterGroupIds =
    viewFilterGroups?.map((viewFilter) => viewFilter.id) ?? [];

  const handleDropdownClickOutside = useCallback(() => {}, []);

  const handleDropdownClose = () => {};

  const removeAdvancedFilter = useCallback(async () => {
    for (const viewFilterGroupId of viewFilterGroupIds) {
      await deleteCombinedViewFilterGroup(viewFilterGroupId);
    }
    for (const viewFilterId of viewFilterIds) {
      await deleteCombinedViewFilter(viewFilterId);
    }
  }, [
    viewFilterIds,
    viewFilterGroupIds,
    deleteCombinedViewFilter,
    deleteCombinedViewFilterGroup,
  ]);

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={
        <AdvancedFilterChip onRemove={removeAdvancedFilter} />
      }
      dropdownComponents={
        <AdvancedFilterViewFilterGroup viewBarInstanceId={props.viewBarId} />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={480}
      onClickOutside={handleDropdownClickOutside}
      onClose={handleDropdownClose}
    />
  );
};
