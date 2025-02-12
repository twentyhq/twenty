import { v4 } from 'uuid';

import {
  formatFieldMetadataItemAsFilterDefinition,
  getFilterTypeFromFieldType,
} from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { MenuItem } from 'twenty-ui';
import { getOperandLabel } from '../utils/getOperandLabel';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export const ObjectFilterDropdownOperandSelect = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const { closeDropdown } = useDropdown();

  const operandsForFilterType = isDefined(fieldMetadataItemUsedInDropdown)
    ? getRecordFilterOperands({
        filterType: getFilterTypeFromFieldType(
          fieldMetadataItemUsedInDropdown.type,
        ),
        subFieldName: subFieldNameUsedInDropdown,
      })
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

    if (isValuelessOperand && isDefined(fieldMetadataItemUsedInDropdown)) {
      const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
        field: fieldMetadataItemUsedInDropdown,
      });

      applyRecordFilter({
        id: v4(),
        fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
        displayValue: '',
        operand: newOperand,
        value: '',
        definition: filterDefinition,
      });
      return;
    }

    if (
      isDefined(fieldMetadataItemUsedInDropdown) &&
      isDefined(selectedFilter)
    ) {
      const filterType = getFilterTypeFromFieldType(
        fieldMetadataItemUsedInDropdown.type,
      );

      const { value, displayValue } = getInitialFilterValue(
        filterType,
        newOperand,
        selectedFilter.value,
        selectedFilter.displayValue,
      );

      const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
        field: fieldMetadataItemUsedInDropdown,
      });

      applyRecordFilter({
        id: selectedFilter.id ? selectedFilter.id : v4(),
        fieldMetadataId: selectedFilter.fieldMetadataId,
        displayValue,
        operand: newOperand,
        value,
        definition: filterDefinition,
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
