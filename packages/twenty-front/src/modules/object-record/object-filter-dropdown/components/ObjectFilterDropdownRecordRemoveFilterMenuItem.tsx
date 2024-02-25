import { MenuItem } from 'tsup.ui.index';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { IconFilterOff } from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

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
