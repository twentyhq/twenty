import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { FilterDropdownId } from '../../view-bar/constants/FilterDropdownId';
import { useViewBarContext } from '../../view-bar/hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../../view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../../view-bar/states/filterDropdownSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../../view-bar/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../../view-bar/states/selectedOperandInDropdownScopedState';

export const MultipleFiltersButton = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: FilterDropdownId,
  });

  const [, setIsFilterDropdownOperandSelectUnfolded] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

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
