import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { IconChevronDown } from '@/ui/icon';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '../utils/getOperandLabel';

export function FilterDropdownOperandButton() {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

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
}
