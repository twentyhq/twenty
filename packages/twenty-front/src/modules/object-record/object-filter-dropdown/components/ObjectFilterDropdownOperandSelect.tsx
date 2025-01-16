import { v4 } from 'uuid';

import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { MenuItem } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { getRecordFilterOperandsForRecordFilterDefinition } from '../../record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { getOperandLabel } from '../utils/getOperandLabel';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export const ObjectFilterDropdownOperandSelect = () => {
  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const { closeDropdown } = useDropdown();

  const operandsForFilterType = isDefined(filterDefinitionUsedInDropdown)
    ? getRecordFilterOperandsForRecordFilterDefinition(
        filterDefinitionUsedInDropdown,
      )
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
      applyRecordFilter({
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

      applyRecordFilter({
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
