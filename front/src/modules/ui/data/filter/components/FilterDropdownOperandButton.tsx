import { IconChevronDown } from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';

import { useFilter } from '../hooks/useFilter';
import { getOperandLabel } from '../utils/getOperandLabel';

export const FilterDropdownOperandButton = () => {
  const {
    selectedOperandInDropdown,
    setIsFilterDropdownOperandSelectUnfolded,
    isFilterDropdownOperandSelectUnfolded,
  } = useFilter();

  if (isFilterDropdownOperandSelectUnfolded) {
    return null;
  }

  return (
    <DropdownMenuHeader
      key={'selected-filter-operand'}
      EndIcon={IconChevronDown}
      onClick={() => setIsFilterDropdownOperandSelectUnfolded(true)}
    >
      {getOperandLabel(selectedOperandInDropdown)}
    </DropdownMenuHeader>
  );
};
