import React from 'react';
import { useTheme } from '@emotion/react';

import { IconChevronDown } from '@/ui/display/icon/index';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { useFilter } from '../hooks/useFilter';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';

export const SingleEntityFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const {
    availableFilters,
    selectedFilters,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  } = useFilter();

  const availableFilter = availableFilters[0];

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
            {selectedFilters[0] ? (
              <GenericEntityFilterChip
                filter={selectedFilters[0]}
                Icon={
                  selectedFilters[0].operand === ViewFilterOperand.IsNotNull
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
