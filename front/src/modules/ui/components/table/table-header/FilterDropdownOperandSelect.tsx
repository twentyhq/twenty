import { useActiveTableFilterCurrentlyEditedInDropdown } from '@/lib/filters-and-sorts/hooks/useActiveFilterCurrentlyEditedInDropdown';
import { useUpsertActiveFilter } from '@/lib/filters-and-sorts/hooks/useUpsertActiveFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/lib/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { FilterOperand } from '@/lib/filters-and-sorts/types/FilterOperand';
import { getOperandLabel } from '@/lib/filters-and-sorts/utils/getOperandLabel';
import { getOperandsForFilterType } from '@/lib/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';

import DropdownButton from './DropdownButton';

export function FilterDropdownOperandSelect() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const operandsForFilterType = getOperandsForFilterType(
    tableFilterDefinitionUsedInDropdown?.type,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      TableContext,
    );

  const activeTableFilterCurrentlyEditedInDropdown =
    useActiveTableFilterCurrentlyEditedInDropdown(TableContext);

  const upsertActiveTableFilter = useUpsertActiveFilter(TableContext);

  function handleOperangeChange(newOperand: FilterOperand) {
    setSelectedOperandInDropdown(newOperand);
    setIsOperandSelectionUnfolded(false);

    if (
      tableFilterDefinitionUsedInDropdown &&
      activeTableFilterCurrentlyEditedInDropdown
    ) {
      upsertActiveTableFilter({
        field: activeTableFilterCurrentlyEditedInDropdown.field,
        displayValue: activeTableFilterCurrentlyEditedInDropdown.displayValue,
        operand: newOperand,
        type: activeTableFilterCurrentlyEditedInDropdown.type,
        value: activeTableFilterCurrentlyEditedInDropdown.value,
      });
    }
  }

  if (!isOperandSelectionUnfolded) {
    return <></>;
  }

  return (
    <DropdownMenuItemContainer>
      {operandsForFilterType.map((filterOperand, index) => (
        <DropdownButton.StyledDropdownItem
          key={`select-filter-operand-${index}`}
          onClick={() => {
            handleOperangeChange(filterOperand);
          }}
        >
          {getOperandLabel(filterOperand)}
        </DropdownButton.StyledDropdownItem>
      ))}
    </DropdownMenuItemContainer>
  );
}
