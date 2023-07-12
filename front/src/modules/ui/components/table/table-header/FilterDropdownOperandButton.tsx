import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/lib/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '@/lib/filters-and-sorts/utils/getOperandLabel';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DropdownButton from './DropdownButton';

export function FilterDropdownOperandButton() {
  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      TableContext,
    );

  if (isOperandSelectionUnfolded) {
    return null;
  }

  return (
    <DropdownButton.StyledDropdownTopOption
      key={'selected-filter-operand'}
      onClick={() => setIsOperandSelectionUnfolded(true)}
    >
      {getOperandLabel(selectedOperandInDropdown)}
      <DropdownButton.StyledDropdownTopOptionAngleDown />
    </DropdownButton.StyledDropdownTopOption>
  );
}
