import React from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

import { ObjectFilterDropdownRecordRemoveFilterMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordRemoveFilterMenuItem';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { GenericEntityFilterChip } from './GenericEntityFilterChip';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from './ObjectFilterDropdownSearchInput';

export const SingleEntityObjectFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const {
    availableFilterDefinitionsState,
    selectedFilterState,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  } = useFilterDropdown();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const selectedFilter = useRecoilValue(selectedFilterState);

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
          <ObjectFilterDropdownSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownRecordRemoveFilterMenuItem />
          <ObjectFilterDropdownRecordSelect />
        </>
      }
    />
  );
};
