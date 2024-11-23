import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { IconCheck } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

const StyledBooleanSelectContainer = styled.div<{ selected?: boolean }>`
  align-items: center;
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) =>
    `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(1)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};

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

  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const { closeDropdown } = useDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const selectedFilter = useRecoilValue(selectedFilterState);

  const [selectedValue, setSelectedValue] = useState<boolean | undefined>(
    selectedFilter?.value === 'true',
  );

  useEffect(() => {
    setSelectedValue(selectedFilter?.value === 'true');
  }, [selectedFilter?.value]);

  const handleOptionSelect = (value: boolean) => {
    if (
      !isDefined(filterDefinitionUsedInDropdown) ||
      !isDefined(selectedOperandInDropdown)
    ) {
      return;
    }

    selectFilter({
      id: selectedFilter?.id ?? v4(),
      definition: filterDefinitionUsedInDropdown,
      operand: selectedOperandInDropdown,
      displayValue: value ? 'True' : 'False',
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: value.toString(),
      viewFilterGroupId: selectedFilter?.viewFilterGroupId,
    });

    setSelectedValue(value);
    closeDropdown();
  };

  return (
    <SelectableList
      selectableListId="boolean-select"
      selectableItemIdArray={options.map((option) => option.toString())}
      hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
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
