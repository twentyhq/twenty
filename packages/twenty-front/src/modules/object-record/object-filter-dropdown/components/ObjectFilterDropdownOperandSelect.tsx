import { useRecoilValue } from 'recoil';
import { DropdownMenuItemsContainer, MenuItem } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const ObjectFilterDropdownOperandSelect = () => {
  const {
    filterDefinitionUsedInDropdownState,
    setSelectedOperandInDropdown,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  const isObjectFilterDropdownOperandSelectUnfolded = useRecoilValue(
    isObjectFilterDropdownOperandSelectUnfoldedState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);

  const operandsForFilterType = getOperandsForFilterType(
    filterDefinitionUsedInDropdown?.type,
  );

  const handleOperangeChange = (newOperand: ViewFilterOperand) => {
    setSelectedOperandInDropdown(newOperand);
    setIsObjectFilterDropdownOperandSelectUnfolded(false);

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedFilter)
    ) {
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
