import { IconChevronDown } from 'twenty-ui';

import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';

import { ObjectFilterDropdownOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandSelect';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';

import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { getOperandLabel } from '../utils/getOperandLabel';

const StyledDropdownMenuHeader = styled(DropdownMenuHeader)`
  cursor: pointer;
`;

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
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <StyledDropdownMenuHeader
          key={'selected-filter-operand'}
          EndIcon={IconChevronDown}
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
  );
};
