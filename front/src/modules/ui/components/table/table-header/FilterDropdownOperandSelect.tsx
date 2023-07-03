import { useSelectedFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useSelectedFilterCurrentlyEditedInDropdown';
import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { FilterOperandType } from '@/filters-and-sorts/interfaces/filters/interface';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '@/filters-and-sorts/utils/getOperandLabel';
import { getOperandsForFilterType } from '@/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';

import DropdownButton from './DropdownButton';

export function FilterDropdownOperandSelect() {
  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const operandsForFilterType = getOperandsForFilterType(
    selectedFilterInDropdown?.type,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      TableContext,
    );

  const selectedFilterCurrentlyEditedInDropdown =
    useSelectedFilterCurrentlyEditedInDropdown();
  const upsertSelectedFilter = useUpsertSelectedFilter();

  function handleOperangeChange(newOperand: FilterOperandType) {
    setSelectedOperandInDropdown(newOperand);
    setIsOperandSelectionUnfolded(false);

    if (selectedFilterInDropdown && selectedFilterCurrentlyEditedInDropdown) {
      upsertSelectedFilter({
        field: selectedFilterCurrentlyEditedInDropdown.field,
        displayValue: selectedFilterCurrentlyEditedInDropdown.displayValue,
        operand: newOperand,
        type: selectedFilterCurrentlyEditedInDropdown.type,
        value: selectedFilterCurrentlyEditedInDropdown.value,
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
