import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ViewFilterOperand } from '~/generated/graphql';

import { useFilterCurrentlyEdited } from '../../view-bar/hooks/useFilterCurrentlyEdited';
import { useUpsertFilter } from '../../view-bar/hooks/useUpsertFilter';
import { useViewBarContext } from '../../view-bar/hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../../view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../../view-bar/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../../view-bar/states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '../../view-bar/utils/getOperandLabel';
import { getOperandsForFilterType } from '../../view-bar/utils/getOperandsForFilterType';

export const FilterDropdownOperandSelect = () => {
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

  const handleOperangeChange = (newOperand: ViewFilterOperand) => {
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
  };

  if (!isFilterDropdownOperandSelectUnfolded) {
    return <></>;
  }

  return (
    <DropdownMenuItemsContainer>
      {operandsForFilterType.map((filterOperand, index) => (
        <MenuItem
          key={`select-filter-operand-${index}`}
          onClick={() => {
            handleOperangeChange(filterOperand);
          }}
          text={getOperandLabel(filterOperand)}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
