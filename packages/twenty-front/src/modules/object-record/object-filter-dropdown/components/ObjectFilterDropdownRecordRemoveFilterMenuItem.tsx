import {
  DropdownMenuItemsContainer,
  IconFilterOff,
  MenuItem,
  useDropdown,
} from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';

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
