import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterGroup';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from 'twenty-ui';

interface AdvancedFilterDropdownButtonProps {
  viewBarId: string;
}

export const AdvancedFilterDropdownButton = (
  props: AdvancedFilterDropdownButtonProps,
) => {
  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const advancedViewFilterIds =
    currentViewWithCombinedFiltersAndSorts?.viewFilters
      .filter((viewFilter) => isDefined(viewFilter.viewFilterGroupId))
      .map((viewFilter) => viewFilter.id);

  const handleDropdownClickOutside = useCallback(() => {}, []);

  const handleDropdownClose = () => {};

  const removeAdvancedFilter = useCallback(async () => {
    if (!advancedViewFilterIds) {
      throw new Error('No advanced view filters to remove');
    }

    const viewFilterGroupIds =
      currentViewWithCombinedFiltersAndSorts?.viewFilterGroups?.map(
        (viewFilter) => viewFilter.id,
      ) ?? [];

    for (const viewFilterGroupId of viewFilterGroupIds) {
      await deleteCombinedViewFilterGroup(viewFilterGroupId);
    }
    for (const viewFilterId of advancedViewFilterIds) {
      await deleteCombinedViewFilter(viewFilterId);
    }
  }, [
    advancedViewFilterIds,
    deleteCombinedViewFilter,
    deleteCombinedViewFilterGroup,
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups,
  ]);

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={
        <AdvancedFilterChip
          onRemove={removeAdvancedFilter}
          advancedFilterCount={advancedViewFilterIds?.length}
        />
      }
      dropdownComponents={
        <AdvancedFilterViewFilterGroup viewBarInstanceId={props.viewBarId} />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={560}
      onClickOutside={handleDropdownClickOutside}
      onClose={handleDropdownClose}
    />
  );
};
