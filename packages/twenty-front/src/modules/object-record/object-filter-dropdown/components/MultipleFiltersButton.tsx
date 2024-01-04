import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

export const MultipleFiltersButton = () => {
  const { resetFilter } = useFilterDropdown();

  const { isDropdownOpen, toggleDropdown } = useDropdown(
    ObjectFilterDropdownId,
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
