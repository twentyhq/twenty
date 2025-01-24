import { useTheme } from '@emotion/react';
import React from 'react';
import { IconChevronDown } from 'twenty-ui';

import { ObjectFilterDropdownRecordRemoveFilterMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordRemoveFilterMenuItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { getRecordFilterOperandsForRecordFilterDefinition } from '../../record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from './ObjectFilterDropdownSearchInput';

const SINGLE_ENTITY_FILTER_DROPDOWN_ID = 'single-entity-filter-dropdown';

export const SingleEntityObjectFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const availableFilterDefinition = availableFilterDefinitions[0];

  React.useEffect(() => {
    setFilterDefinitionUsedInDropdown(availableFilterDefinition);
    const defaultOperand = getRecordFilterOperandsForRecordFilterDefinition(
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
