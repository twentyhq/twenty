import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';

import { getOperandLabel } from '../utils/getOperandLabel';

export const ObjectFilterDropdownOperandButton = () => {
  const {
    selectedOperandInDropdownState,
    setIsObjectFilterDropdownOperandSelectUnfolded,
  } = useFilterDropdown();

  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  return (
    <DropdownMenuHeader
      key={'selected-filter-operand'}
      EndIcon={IconChevronDown}
      onClick={() => setIsObjectFilterDropdownOperandSelectUnfolded(true)}
    >
      {getOperandLabel(selectedOperandInDropdown)}
    </DropdownMenuHeader>
  );
};
