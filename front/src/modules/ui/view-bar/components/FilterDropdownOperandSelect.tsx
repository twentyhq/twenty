import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';
import { useUpsertFilter } from '../hooks/useUpsertFilter';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { FilterOperand } from '../types/FilterOperand';
import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export function FilterDropdownOperandSelect() {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const operandsForFilterType = getOperandsForFilterType(
    filterDefinitionUsedInDropdown?.type,
  );

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  const upsertFilter = useUpsertFilter();

  function handleOperangeChange(newOperand: FilterOperand) {
    setSelectedOperandInDropdown(newOperand);
    setIsFilterDropdownOperandSelectUnfolded(false);

    if (filterDefinitionUsedInDropdown && filterCurrentlyEdited) {
      upsertFilter({
        key: filterCurrentlyEdited.key,
        displayValue: filterCurrentlyEdited.displayValue,
        operand: newOperand,
        type: filterCurrentlyEdited.type,
        value: filterCurrentlyEdited.value,
      });
    }
  }

  if (!isFilterDropdownOperandSelectUnfolded) {
    return <></>;
  }

  return (
    <StyledDropdownMenuItemsContainer>
      {operandsForFilterType.map((filterOperand, index) => (
        <MenuItem
          key={`select-filter-operand-${index}`}
          onClick={() => {
            handleOperangeChange(filterOperand);
          }}
          text={getOperandLabel(filterOperand)}
        />
      ))}
    </StyledDropdownMenuItemsContainer>
  );
}
