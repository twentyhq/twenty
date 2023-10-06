import { useEffect } from 'react';

import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

import { FilterDropdownDateSearchInput } from './FilterDropdownDateSearchInput';
import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { FilterDropdownFilterSelect } from './FilterDropdownFilterSelect';
import { FilterDropdownNumberSearchInput } from './FilterDropdownNumberSearchInput';
import { FilterDropdownOperandButton } from './FilterDropdownOperandButton';
import { FilterDropdownOperandSelect } from './FilterDropdownOperandSelect';
import { FilterDropdownTextSearchInput } from './FilterDropdownTextSearchInput';

type OwnProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownContent = ({ hotkeyScope }: OwnProps) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [isFilterDropdownOperandSelectUnfolded] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDefinitionUsedInDropdown, setFilterDefinitionUsedInDropdown] =
    useRecoilScopedState(
      filterDefinitionUsedInDropdownScopedState,
      ViewBarRecoilScopeContext,
    );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(
      selectedOperandInDropdownScopedState,
      ViewBarRecoilScopeContext,
    );

  const [filters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );

  const activeViewBarFilterKey = hotkeyScope.scope.split('-')[0];
  const activeFilterInViewBar = activeViewBarFilterKey
    ? availableFilters.find((filter) => filter.key === activeViewBarFilterKey)
    : undefined;

  const activeFilterOperand = filters.find(
    (filter) => filter.key === activeFilterInViewBar?.key,
  )?.operand;

  useEffect(() => {
    if (activeFilterInViewBar) {
      setFilterDefinitionUsedInDropdown(activeFilterInViewBar);
      if (activeFilterOperand) {
        setSelectedOperandInDropdown(activeFilterOperand);
      }
    }
  }, [
    activeFilterInViewBar,
    activeFilterOperand,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  ]);

  return (
    <StyledDropdownMenu>
      <>
        {!filterDefinitionUsedInDropdown ? (
          <FilterDropdownFilterSelect />
        ) : isFilterDropdownOperandSelectUnfolded ? (
          <FilterDropdownOperandSelect />
        ) : (
          selectedOperandInDropdown && (
            <>
              <FilterDropdownOperandButton />
              <StyledDropdownMenuSeparator />
              {filterDefinitionUsedInDropdown.type === 'text' && (
                <FilterDropdownTextSearchInput />
              )}
              {filterDefinitionUsedInDropdown.type === 'number' && (
                <FilterDropdownNumberSearchInput />
              )}
              {filterDefinitionUsedInDropdown.type === 'date' && (
                <FilterDropdownDateSearchInput />
              )}
              {filterDefinitionUsedInDropdown.type === 'entity' && (
                <FilterDropdownEntitySearchInput />
              )}
              {filterDefinitionUsedInDropdown.type === 'entity' && (
                <FilterDropdownEntitySelect />
              )}
            </>
          )
        )}
      </>
    </StyledDropdownMenu>
  );
};
