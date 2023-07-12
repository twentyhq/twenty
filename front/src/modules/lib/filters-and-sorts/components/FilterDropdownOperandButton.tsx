import { Context } from 'react';

import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/lib/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '@/lib/filters-and-sorts/utils/getOperandLabel';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import DropdownButton from './DropdownButton';

export function FilterDropdownOperandButton({
  context,
}: {
  context: Context<string | null>;
}) {
  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      context,
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
