import { useActiveTableFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useActiveFilterCurrentlyEditedInDropdown';
import { useUpsertActiveTableFilter } from '@/filters-and-sorts/hooks/useUpsertActiveTableFilter';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { TableFilterOperand } from '@/filters-and-sorts/types/TableFilterOperand';
import { getOperandLabel } from '@/filters-and-sorts/utils/getOperandLabel';
import { getOperandsForFilterType } from '@/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';

import DropdownButton from './DropdownButton';

export function FilterDropdownOperandSelect() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
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
    useActiveTableFilterCurrentlyEditedInDropdown();

  const upsertActiveTableFilter = useUpsertActiveTableFilter();

  function handleOperangeChange(newOperand: TableFilterOperand) {
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
