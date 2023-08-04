import { Context } from 'react';
import { useTheme } from '@emotion/react';
import { IconChevronDown } from '@tabler/icons-react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '../utils/getOperandLabel';

export function FilterDropdownOperandButton({
  context,
}: {
  context: Context<string | null>;
}) {
  const theme = useTheme();

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
    <DropdownMenuHeader
      key={'selected-filter-operand'}
      endIcon={<IconChevronDown size={theme.icon.size.md} />}
      onClick={() => setIsOperandSelectionUnfolded(true)}
    >
      {getOperandLabel(selectedOperandInDropdown)}
    </DropdownMenuHeader>
  );
}
