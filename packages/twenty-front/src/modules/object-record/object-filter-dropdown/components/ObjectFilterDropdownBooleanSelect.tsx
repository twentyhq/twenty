import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/display';

const StyledBooleanSelectContainer = styled.div<{ selected?: boolean }>`
  align-items: center;
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) =>
    `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(1)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledIconCheckContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

export const ObjectFilterDropdownBooleanSelect = () => {
  const theme = useTheme();
  const options = [true, false];

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const { closeDropdown } = useDropdown();

  const [selectedValue, setSelectedValue] = useState<boolean | undefined>(
    selectedFilter?.value === 'true',
  );

  useEffect(() => {
    setSelectedValue(selectedFilter?.value === 'true');
  }, [selectedFilter?.value]);

  const handleOptionSelect = (value: boolean) => {
    if (
      !isDefined(fieldMetadataItemUsedInDropdown) ||
      !isDefined(selectedOperandInDropdown)
    ) {
      return;
    }

    applyRecordFilter({
      id: selectedFilter?.id ?? v4(),
      operand: selectedOperandInDropdown,
      displayValue: value ? 'True' : 'False',
      fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
      value: value.toString(),
      recordFilterGroupId: selectedFilter?.recordFilterGroupId,
      positionInRecordFilterGroup: selectedFilter?.positionInRecordFilterGroup,
      type: getFilterTypeFromFieldType(fieldMetadataItemUsedInDropdown.type),
      label: fieldMetadataItemUsedInDropdown.label,
      subFieldName: selectedFilter?.subFieldName,
    });

    setSelectedValue(value);
    closeDropdown();
  };

  return (
    <SelectableList
      selectableListInstanceId="boolean-select"
      selectableItemIdArray={options.map((option) => option.toString())}
      hotkeyScope={SingleRecordPickerHotkeyScope.SingleRecordPicker}
      onEnter={(itemId) => {
        handleOptionSelect(itemId === 'true');
      }}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {options.map((option) => (
          <StyledBooleanSelectContainer
            key={String(option)}
            onClick={() => handleOptionSelect(option)}
            selected={selectedValue === option}
          >
            <BooleanDisplay value={option} />
            {selectedFilter?.value === option.toString() && (
              <StyledIconCheckContainer>
                <IconCheck color={theme.grayScale.gray50} size={16} />
              </StyledIconCheckContainer>
            )}
          </StyledBooleanSelectContainer>
        ))}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
