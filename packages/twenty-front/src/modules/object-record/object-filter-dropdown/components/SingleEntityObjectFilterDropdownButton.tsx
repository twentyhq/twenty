import { useTheme } from '@emotion/react';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

import { ObjectFilterDropdownRecordRemoveFilterMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordRemoveFilterMenuItem';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { getOperandsForFilterDefinition } from '../utils/getOperandsForFilterType';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from './ObjectFilterDropdownSearchInput';

const SINGLE_ENTITY_FILTER_DROPDOWN_ID = 'single-entity-filter-dropdown';

export const SingleEntityObjectFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const {
    selectedFilterState,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  } = useFilterDropdown();

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );
  const selectedFilter = useRecoilValue(selectedFilterState);

  const availableFilterDefinition = availableFilterDefinitions[0];

  React.useEffect(() => {
    setFilterDefinitionUsedInDropdown(availableFilterDefinition);
    const defaultOperand = getOperandsForFilterDefinition(
      availableFilterDefinition,
    )[0];
    setSelectedOperandInDropdown(defaultOperand);
  }, [
    availableFilterDefinition,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  ]);

  const theme = useTheme();

  return (
    <Dropdown
      dropdownId={SINGLE_ENTITY_FILTER_DROPDOWN_ID}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ x: 0, y: -28 }}
      clickableComponent={
        <StyledHeaderDropdownButton>
          {selectedFilter ? (
            <GenericEntityFilterChip
              filter={selectedFilter}
              Icon={
                selectedFilter.operand === ViewFilterOperand.IsNotNull
                  ? availableFilterDefinition.SelectAllIcon
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
          <ObjectFilterDropdownRecordSelect
            viewComponentId={SINGLE_ENTITY_FILTER_DROPDOWN_ID}
          />
        </>
      }
    />
  );
};
