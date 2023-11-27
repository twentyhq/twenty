import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';
import { useFilter } from '../hooks/useFilter';

export const MultipleFiltersButton = () => {
  const { resetFilter } = useFilter();

  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectFilterDropdownId,
  });

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
