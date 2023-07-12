import { useFilterCurrentlyEdited } from '@/lib/filters-and-sorts/hooks/useFilterCurrentlyEdited';
import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
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

  const activeTableFilterCurrentlyEdited =
    useFilterCurrentlyEdited(TableContext);

  const upsertActiveTableFilter = useUpsertFilter(TableContext);

  function handleOperangeChange(newOperand: FilterOperand) {
    setSelectedOperandInDropdown(newOperand);
    setIsOperandSelectionUnfolded(false);

    if (
      tableFilterDefinitionUsedInDropdown &&
      activeTableFilterCurrentlyEdited
    ) {
      upsertActiveTableFilter({
        field: activeTableFilterCurrentlyEdited.field,
        displayValue: activeTableFilterCurrentlyEdited.displayValue,
        operand: newOperand,
        type: activeTableFilterCurrentlyEdited.type,
        value: activeTableFilterCurrentlyEdited.value,
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
