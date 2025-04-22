import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { IconButton } from 'twenty-ui/input';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterRecordFilterGroupOptionsDropdownProps = {
  recordFilterGroupId: string;
};

export const AdvancedFilterRecordFilterGroupOptionsDropdown = ({
  recordFilterGroupId,
}: AdvancedFilterRecordFilterGroupOptionsDropdownProps) => {
  const dropdownId = `advanced-filter-record-filter-group-options-${recordFilterGroupId}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();
  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const { childRecordFilters } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId,
  });

  const handleRemove = () => {
    for (const childRecordFilter of childRecordFilters ?? []) {
      removeRecordFilter({ recordFilterId: childRecordFilter.id });
    }

    removeRecordFilterGroup(recordFilterGroupId);

    removeRootRecordFilterGroupIfEmpty();

    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <IconButton
          aria-label="Filter group rule options"
          variant="tertiary"
          Icon={IconDotsVertical}
        />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            text="Remove rule group"
            onClick={handleRemove}
            LeftIcon={IconTrash}
            accent="danger"
          />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
      dropdownOffset={{ y: 2, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
