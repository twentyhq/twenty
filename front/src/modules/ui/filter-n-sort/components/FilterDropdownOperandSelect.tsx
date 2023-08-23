import { Context } from 'react';

import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';
import { useUpsertFilter } from '../hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { FilterOperand } from '../types/FilterOperand';
import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export function FilterDropdownOperandSelect({
  context,
}: {
  context: Context<string | null>;
}) {
  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const operandsForFilterType = getOperandsForFilterType(
    filterDefinitionUsedInDropdown?.type,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      context,
    );

  const filterCurrentlyEdited = useFilterCurrentlyEdited(context);

  const upsertFilter = useUpsertFilter(context);

  function handleOperangeChange(newOperand: FilterOperand) {
    setSelectedOperandInDropdown(newOperand);
    setIsOperandSelectionUnfolded(false);

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

  if (!isOperandSelectionUnfolded) {
    return <></>;
  }

  return (
    <DropdownMenuItemsContainer>
      {operandsForFilterType.map((filterOperand, index) => (
        <DropdownMenuItem
          key={`select-filter-operand-${index}`}
          onClick={() => {
            handleOperangeChange(filterOperand);
          }}
        >
          {getOperandLabel(filterOperand)}
        </DropdownMenuItem>
      ))}
    </DropdownMenuItemsContainer>
  );
}
