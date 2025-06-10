import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';

import { ObjectFilterDropdownOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandSelect';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';

import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui/display';
import { getOperandLabel } from '../utils/getOperandLabel';

const StyledDropdownMenuHeader = styled(DropdownMenuHeader)`
  cursor: pointer;
`;

export const OPERAND_DROPDOWN_CLICK_OUTSIDE_ID =
  'object-filter-dropdown-operand-dropdown-click-outside-id';

export const ObjectFilterDropdownOperandDropdown = ({
  filterDropdownId,
}: {
  filterDropdownId?: string;
}) => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const theme = useTheme();

  const dropdownId = `${filterDropdownId}-operand-dropdown`;

  return (
    <ClickOutsideListenerContext.Provider
      value={{ excludedClickOutsideId: OPERAND_DROPDOWN_CLICK_OUTSIDE_ID }}
    >
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <StyledDropdownMenuHeader
            key={'selected-filter-operand'}
            EndComponent={<IconChevronDown />}
          >
            {getOperandLabel(selectedOperandInDropdown)}
          </StyledDropdownMenuHeader>
        }
        dropdownComponents={<ObjectFilterDropdownOperandSelect />}
        dropdownHotkeyScope={{
          scope: FiltersHotkeyScope.ObjectFilterDropdownOperandDropdown,
        }}
        dropdownOffset={{ x: parseInt(theme.spacing(2), 10) }}
      />
    </ClickOutsideListenerContext.Provider>
  );
};
