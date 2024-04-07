import { IconFilterOff } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

export const ObjectFilterDropdownRecordRemoveFilterMenuItem = () => {
  const { emptyFilterButKeepDefinition } = useFilterDropdown();

  const { closeDropdown } = useDropdown();

  const handleRemoveFilter = () => {
    emptyFilterButKeepDefinition();
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
