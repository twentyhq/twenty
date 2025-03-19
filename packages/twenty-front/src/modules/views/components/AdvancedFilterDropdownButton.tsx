import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterRootLevelViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRootLevelViewFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

export const AdvancedFilterDropdownButton = () => {
  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const outermostRecordFilterGroupId = currentRecordFilterGroups.find(
    (recordFilterGroup) => !recordFilterGroup.parentRecordFilterGroupId,
  )?.id;

  if (!outermostRecordFilterGroupId) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={<AdvancedFilterChip />}
      dropdownComponents={<AdvancedFilterRootLevelViewFilterGroup />}
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={800}
    />
  );
};
