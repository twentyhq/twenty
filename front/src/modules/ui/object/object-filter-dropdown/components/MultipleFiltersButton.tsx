import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';
import { useFilter } from '../hooks/useFilter';

export const MultipleFiltersButton = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    setObjectFilterDropdownSearchInput,
    setSelectedOperandInDropdown,
  } = useFilter();

  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectFilterDropdownId,
  });

  const resetState = () => {
    setIsObjectFilterDropdownOperandSelectUnfolded(false);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setObjectFilterDropdownSearchInput('');
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
