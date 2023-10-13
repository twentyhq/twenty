import React from 'react';
import { useTheme } from '@emotion/react';

import { filterDefinitionUsedInDropdownScopedState } from '@/ui/Data/View Bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/Data/View Bar/states/selectedOperandInDropdownScopedState';
import { IconChevronDown } from '@/ui/Display/Icon/index';
import { DropdownMenu } from '@/ui/Layout/Dropdown/components/DropdownMenu';
import { DropdownMenuContainer } from '@/ui/Layout/Dropdown/components/DropdownMenuContainer';
import { StyledHeaderDropdownButton } from '@/ui/Layout/Dropdown/components/StyledHeaderDropdownButton';
import { DropdownScope } from '@/ui/Layout/Dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { FilterOperand } from '../types/FilterOperand';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';

export const SingleEntityFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );
  const availableFilter = availableFilters[0];

  const [filters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  React.useEffect(() => {
    setFilterDefinitionUsedInDropdown(availableFilter);
    const defaultOperand = getOperandsForFilterType(availableFilter?.type)[0];
    setSelectedOperandInDropdown(defaultOperand);
  }, [
    availableFilter,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  ]);

  const theme = useTheme();

  return (
    <DropdownScope dropdownScopeId="single-entity-filter-dropdown">
      <DropdownMenu
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ x: 0, y: -28 }}
        clickableComponent={
          <StyledHeaderDropdownButton>
            {filters[0] ? (
              <GenericEntityFilterChip
                filter={filters[0]}
                Icon={
                  filters[0].operand === FilterOperand.IsNotNull
                    ? availableFilter.SelectAllIcon
                    : undefined
                }
              />
            ) : (
              'Filter'
            )}
            <IconChevronDown size={theme.icon.size.md} />
          </StyledHeaderDropdownButton>
        }
        dropdownComponents={
          <DropdownMenuContainer>
            <FilterDropdownEntitySearchInput />
            <FilterDropdownEntitySelect />
          </DropdownMenuContainer>
        }
      />
    </DropdownScope>
  );
};
