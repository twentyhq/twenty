import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterRootLevelViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRootLevelViewFilterGroup';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { isDefined } from 'twenty-shared';

export const AdvancedFilterDropdownButton = () => {
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const advancedRecordFilterIds = currentRecordFilters
    .filter((recordFilter) => isDefined(recordFilter.recordFilterGroupId))
    .map((recordFilter) => recordFilter.id);

  const { removeRecordFilter } = useRemoveRecordFilter();

  const removeAdvancedFilter = useCallback(async () => {
    if (!advancedRecordFilterIds) {
      throw new Error('No advanced view filters to remove');
    }

    const viewFilterGroupIds =
      currentRecordFilterGroups?.map(
        (recordFilterGroup) => recordFilterGroup.id,
      ) ?? [];

    for (const viewFilterGroupId of viewFilterGroupIds) {
      removeRecordFilterGroup(viewFilterGroupId);
    }

    for (const recordFilterId of advancedRecordFilterIds) {
      removeRecordFilter({ recordFilterId });
    }
  }, [
    advancedRecordFilterIds,
    removeRecordFilterGroup,
    removeRecordFilter,
    currentRecordFilterGroups,
  ]);

  const outermostRecordFilterGroupId = currentRecordFilterGroups.find(
    (recordFilterGroup) => !recordFilterGroup.parentRecordFilterGroupId,
  )?.id;

  if (!outermostRecordFilterGroupId) {
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
          rootLevelRecordFilterGroupId={outermostRecordFilterGroupId}
        />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={800}
    />
  );
};
