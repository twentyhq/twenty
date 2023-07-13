import { Context } from 'react';

import { useFilterCurrentlyEdited } from '@/lib/filters-and-sorts/hooks/useFilterCurrentlyEdited';
import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/lib/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { FilterOperand } from '@/lib/filters-and-sorts/types/FilterOperand';
import { getOperandLabel } from '@/lib/filters-and-sorts/utils/getOperandLabel';
import { getOperandsForFilterType } from '@/lib/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';

import DropdownButton from './DropdownButton';

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
        field: filterCurrentlyEdited.field,
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
