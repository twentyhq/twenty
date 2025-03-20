import { IconFilterCog } from 'twenty-ui';

import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { plural } from 'pluralize';
import { isDefined } from 'twenty-shared';

export const AdvancedFilterChip = () => {
  const { closeDropdown } = useDropdown(ADVANCED_FILTER_DROPDOWN_ID);

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
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const handleRemoveClick = () => {
    closeDropdown();

    const viewFilterGroupIds = currentRecordFilterGroups.map(
      (recordFilterGroup) => recordFilterGroup.id,
    );

    for (const viewFilterGroupId of viewFilterGroupIds) {
      removeRecordFilterGroup(viewFilterGroupId);
    }

    for (const recordFilterId of advancedRecordFilterIds) {
      removeRecordFilter({ recordFilterId });
    }

    removeRootRecordFilterGroupIfEmpty();
  };

  const advancedFilterCount = advancedRecordFilterIds.length;

  const labelText = 'advanced rule';
  const chipLabel = `${advancedFilterCount} ${advancedFilterCount === 1 ? labelText : plural(labelText)}`;

  return (
    <SortOrFilterChip
      testId={ADVANCED_FILTER_DROPDOWN_ID}
      labelKey={chipLabel}
      labelValue=""
      Icon={IconFilterCog}
      onRemove={handleRemoveClick}
    />
  );
};
