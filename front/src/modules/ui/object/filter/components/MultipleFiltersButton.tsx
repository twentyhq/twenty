import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { FilterDropdownId } from '../constants/FilterDropdownId';
import { useFilter } from '../hooks/useFilter';

export const MultipleFiltersButton = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setIsFilterDropdownOperandSelectUnfolded,
    setFilterDropdownSearchInput,
    setSelectedOperandInDropdown,
  } = useFilter();

  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: FilterDropdownId,
  });

  const resetState = () => {
    setIsFilterDropdownOperandSelectUnfolded(false);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterDropdownSearchInput('');
  };

  const handleClick = () => {
    toggleDropdown();
    resetState();
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
