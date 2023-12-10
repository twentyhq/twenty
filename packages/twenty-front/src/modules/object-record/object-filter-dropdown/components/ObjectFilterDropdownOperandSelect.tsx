import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const ObjectFilterDropdownOperandSelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    isObjectFilterDropdownOperandSelectUnfolded,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    selectedFilter,
    selectFilter,
  } = useFilterDropdown();

  const operandsForFilterType = getOperandsForFilterType(
    filterDefinitionUsedInDropdown?.type,
  );

  const handleOperangeChange = (newOperand: ViewFilterOperand) => {
    setSelectedOperandInDropdown(newOperand);
    setIsObjectFilterDropdownOperandSelectUnfolded(false);

    if (filterDefinitionUsedInDropdown && selectedFilter) {
      selectFilter?.({
        fieldMetadataId: selectedFilter.fieldMetadataId,
        displayValue: selectedFilter.displayValue,
        operand: newOperand,
        value: selectedFilter.value,
        definition: filterDefinitionUsedInDropdown,
      });
    }
  };

  if (!isObjectFilterDropdownOperandSelectUnfolded) {
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
