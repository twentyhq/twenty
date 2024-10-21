import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterDefinition } from '../utils/getOperandsForFilterType';

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

  const operandsForFilterType = isDefined(filterDefinitionUsedInDropdown)
    ? getOperandsForFilterDefinition(filterDefinitionUsedInDropdown)
    : [];

  const handleOperandChange = (newOperand: ViewFilterOperand) => {
    const isValuelessOperand = [
      ViewFilterOperand.IsEmpty,
      ViewFilterOperand.IsNotEmpty,
      ViewFilterOperand.IsInPast,
      ViewFilterOperand.IsInFuture,
      ViewFilterOperand.IsToday,
    ].includes(newOperand);

    setSelectedOperandInDropdown(newOperand);
    setIsObjectFilterDropdownOperandSelectUnfolded(false);

    if (isValuelessOperand && isDefined(filterDefinitionUsedInDropdown)) {
      selectFilter?.({
        id: v4(),
        fieldMetadataId: filterDefinitionUsedInDropdown?.fieldMetadataId ?? '',
        displayValue: '',
        operand: newOperand,
        value: '',
        definition: filterDefinitionUsedInDropdown,
      });
      return;
    }

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedFilter)
    ) {
      const { value, displayValue } = getInitialFilterValue(
        filterDefinitionUsedInDropdown.type,
        newOperand,
        selectedFilter.value,
        selectedFilter.displayValue,
      );

      selectFilter?.({
        id: selectedFilter.id ? selectedFilter.id : v4(),
        fieldMetadataId: selectedFilter.fieldMetadataId,
        displayValue,
        operand: newOperand,
        value,
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
            handleOperandChange(filterOperand);
          }}
          text={getOperandLabel(filterOperand)}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
