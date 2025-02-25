import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterRootLevelViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRootLevelViewFilterGroup';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from 'twenty-shared';

export const AdvancedFilterDropdownButton = () => {
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const advancedRecordFilterIds = currentRecordFilters
    .filter((recordFilter) => isDefined(recordFilter.viewFilterGroupId))
    .map((recordFilter) => recordFilter.id);

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleDropdownClickOutside = useCallback(() => {}, []);

  const handleDropdownClose = () => {};

  const removeAdvancedFilter = useCallback(async () => {
    if (!advancedRecordFilterIds) {
      throw new Error('No advanced view filters to remove');
    }

    const viewFilterGroupIds =
      currentViewWithCombinedFiltersAndSorts?.viewFilterGroups?.map(
        (viewFilter) => viewFilter.id,
      ) ?? [];

    for (const viewFilterGroupId of viewFilterGroupIds) {
      await deleteCombinedViewFilterGroup(viewFilterGroupId);
    }

    for (const recordFilterId of advancedRecordFilterIds) {
      removeRecordFilter(recordFilterId);
    }
  }, [
    advancedRecordFilterIds,
    removeRecordFilter,
    deleteCombinedViewFilterGroup,
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups,
  ]);

  const outermostViewFilterGroupId =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups.find(
      (viewFilterGroup) => !viewFilterGroup.parentViewFilterGroupId,
    )?.id;

  if (!outermostViewFilterGroupId) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={
        <AdvancedFilterChip
          onRemove={removeAdvancedFilter}
          advancedFilterCount={advancedRecordFilterIds?.length}
        />
      }
      dropdownComponents={
        <AdvancedFilterRootLevelViewFilterGroup
          rootLevelViewFilterGroupId={outermostViewFilterGroupId}
        />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={800}
      onClickOutside={handleDropdownClickOutside}
      onClose={handleDropdownClose}
    />
  );
};
