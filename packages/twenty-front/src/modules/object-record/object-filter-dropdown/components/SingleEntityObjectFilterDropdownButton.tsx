import React from 'react';
import { useTheme } from '@emotion/react';

import { ObjectFilterDropdownRecordRemoveFilterMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordRemoveFilterMenuItem';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { IconChevronDown } from '@/ui/display/icon/index';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { GenericEntityFilterChip } from './GenericEntityFilterChip';
import { ObjectFilterDropdownRecordSearchInput } from './ObjectFilterDropdownEntitySearchInput';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';

export const SingleEntityObjectFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const {
    availableFilterDefinitions,
    selectedFilter,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  } = useFilterDropdown();

  const availableFilter = availableFilterDefinitions[0];

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
    <Dropdown
      dropdownId="single-entity-filter-dropdown"
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ x: 0, y: -28 }}
      clickableComponent={
        <StyledHeaderDropdownButton>
          {selectedFilter ? (
            <GenericEntityFilterChip
              filter={selectedFilter}
              Icon={
                selectedFilter.operand === ViewFilterOperand.IsNotNull
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
          <ObjectFilterDropdownRecordSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownRecordRemoveFilterMenuItem />
          <ObjectFilterDropdownRecordSelect />
        </>
      }
    />
  );
};
