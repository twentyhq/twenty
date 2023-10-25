import React from 'react';
import { useTheme } from '@emotion/react';

import { IconChevronDown } from '@/ui/display/icon/index';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ViewFilterOperand } from '~/generated/graphql';

import { useViewBarContext } from '../../../../views/components/view-bar/hooks/useViewBarContext';
import { availableFiltersScopedState } from '../../../../views/components/view-bar/states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../../../../views/components/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filtersScopedState } from '../../../../views/components/view-bar/states/filtersScopedState';
import { selectedOperandInDropdownScopedState } from '../../../../views/components/view-bar/states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '../../../../views/components/view-bar/utils/getOperandsForFilterType';

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
      <Dropdown
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ x: 0, y: -28 }}
        clickableComponent={
          <StyledHeaderDropdownButton>
            {filters[0] ? (
              <GenericEntityFilterChip
                filter={filters[0]}
                Icon={
                  filters[0].operand === ViewFilterOperand.IsNotNull
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
          <>
            <FilterDropdownEntitySearchInput />
            <FilterDropdownEntitySelect />
          </>
        }
      />
    </DropdownScope>
  );
};
