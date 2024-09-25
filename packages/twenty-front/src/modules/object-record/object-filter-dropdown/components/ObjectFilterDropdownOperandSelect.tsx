import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

import { getViewFilterValueType } from '@/object-record/object-filter-dropdown/utils/getViewFilterValueType';
import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';
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
        valueType: ViewFilterValueType.STATIC,
        definition: filterDefinitionUsedInDropdown,
      });
      return;
    }

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedFilter)
    ) {
      const valueType = getViewFilterValueType(
        filterDefinitionUsedInDropdown,
        newOperand,
      );
      const valueTypeChanged = valueType !== selectedFilter.valueType;
      const value = valueTypeChanged ? '' : selectedFilter.value;

      selectFilter?.({
        id: selectedFilter.id ? selectedFilter.id : v4(),
        fieldMetadataId: selectedFilter.fieldMetadataId,
        displayValue: selectedFilter.displayValue,
        operand: newOperand,
        value,
        valueType,
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
