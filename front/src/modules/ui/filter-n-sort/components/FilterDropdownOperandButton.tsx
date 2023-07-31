import { Context } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '../utils/getOperandLabel';

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
