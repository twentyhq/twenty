import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { IconChevronDown } from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';

import { getOperandLabel } from '../utils/getOperandLabel';

export const ObjectFilterDropdownOperandButton = () => {
  const {
    selectedOperandInDropdown,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    isObjectFilterDropdownOperandSelectUnfolded,
  } = useFilterDropdown();

  if (isObjectFilterDropdownOperandSelectUnfolded) {
    return null;
  }

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
