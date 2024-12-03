import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { MenuItem } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { getOperandLabel } from '../utils/getOperandLabel';
import { getOperandsForFilterDefinition } from '../utils/getOperandsForFilterType';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export const ObjectFilterDropdownOperandSelect = () => {
  const {
    filterDefinitionUsedInDropdownState,
    setSelectedOperandInDropdown,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const { closeDropdown } = useDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
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

  return (
    <StyledDropdownMenuItemsContainer>
      {operandsForFilterType.map((filterOperand, index) => (
        <MenuItem
          key={`select-filter-operand-${index}`}
          onClick={() => {
            handleOperandChange(filterOperand);
            closeDropdown();
          }}
          text={getOperandLabel(filterOperand)}
        />
      ))}
    </StyledDropdownMenuItemsContainer>
  );
};
