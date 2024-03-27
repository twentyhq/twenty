import { StyledHeaderDropdownButton, useDropdown } from 'twenty-ui';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';

export const MultipleFiltersButton = () => {
  const { resetFilter } = useFilterDropdown();

  const { isDropdownOpen, toggleDropdown } = useDropdown(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const handleClick = () => {
    toggleDropdown();
    resetFilter();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={handleClick}
    >
      Filter
    </StyledHeaderDropdownButton>
  );
};
