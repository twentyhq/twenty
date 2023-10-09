import { useEffect } from 'react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { IconChevronDown } from '@/ui/icon';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '../utils/getOperandLabel';

export const FilterDropdownOperandButton = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(
      selectedOperandInDropdownScopedState,
      ViewBarRecoilScopeContext,
    );

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  useEffect(() => {
    if (
      filterCurrentlyEdited &&
      selectedOperandInDropdown !== filterCurrentlyEdited.operand
    ) {
      setSelectedOperandInDropdown(filterCurrentlyEdited.operand);
    }
  }, [
    filterCurrentlyEdited,
    selectedOperandInDropdown,
    setSelectedOperandInDropdown,
  ]);

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
