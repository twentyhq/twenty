import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { useUpsertFilter } from '../../../../views/hooks/useUpsertFilter';
import { useFilter } from '../hooks/useFilter';
import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';
import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const FilterDropdownOperandSelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  } = useFilter();

  const operandsForFilterType = getOperandsForFilterType(
    filterDefinitionUsedInDropdown?.type,
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
