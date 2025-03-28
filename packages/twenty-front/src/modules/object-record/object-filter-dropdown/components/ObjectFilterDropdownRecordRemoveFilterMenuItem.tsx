import { useEmptyRecordFilter } from '@/object-record/object-filter-dropdown/hooks/useEmptyRecordFilter';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from 'twenty-ui/navigation';
import { IconFilterOff } from 'twenty-ui/display';

export const ObjectFilterDropdownRecordRemoveFilterMenuItem = () => {
  const { emptyRecordFilter } = useEmptyRecordFilter();

  const { closeDropdown } = useDropdown();

  const handleRemoveFilter = () => {
    emptyRecordFilter();
    closeDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
      <MenuItem
        onClick={handleRemoveFilter}
        LeftIcon={IconFilterOff}
        text={'Remove filter'}
      />
    </DropdownMenuItemsContainer>
  );
};
