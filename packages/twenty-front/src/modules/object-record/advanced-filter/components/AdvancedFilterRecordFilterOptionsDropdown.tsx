import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared';
import { IconButton, IconDotsVertical, MenuItem } from 'twenty-ui';

type AdvancedFilterRecordFilterOptionsDropdownProps = {
  recordFilterId: string;
};

export const AdvancedFilterRecordFilterOptionsDropdown = ({
  recordFilterId,
}: AdvancedFilterRecordFilterOptionsDropdownProps) => {
  const dropdownId = `advanced-filter-record-filter-options-${recordFilterId}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: currentRecordFilter?.recordFilterGroupId,
    });

  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const handleRemove = async () => {
    closeDropdown();

    if (isDefined(currentRecordFilter?.recordFilterGroupId)) {
      const isOnlyViewFilterInGroup =
        childRecordFiltersAndRecordFilterGroups?.length === 1;

      if (isOnlyViewFilterInGroup) {
        removeRecordFilterGroup(currentRecordFilter.recordFilterGroupId);
      }
    }

    removeRecordFilter({ recordFilterId: recordFilterId });

    removeRootRecordFilterGroupIfEmpty();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <IconButton
          aria-label="Record filter rule options"
          variant="tertiary"
          Icon={IconDotsVertical}
        />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem text="Remove rule" onClick={handleRemove} />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
