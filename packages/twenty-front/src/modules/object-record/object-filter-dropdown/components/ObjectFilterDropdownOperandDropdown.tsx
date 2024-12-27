import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';

import { ObjectFilterDropdownOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandSelect';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
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
  const { selectedOperandInDropdownState } = useFilterDropdown();

  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
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
      dropdownOffset={{
        x: parseInt(theme.spacing(2), 10),
      }}
    />
  );
};
