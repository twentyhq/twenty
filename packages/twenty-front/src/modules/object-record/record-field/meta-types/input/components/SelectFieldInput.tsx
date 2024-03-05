import { useState } from 'react';
import styled from '@emotion/styled';

import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItemSelectTag } from '@/ui/navigation/menu-item/components/MenuItemSelectTag';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type SelectFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const SelectFieldInput = ({ onSubmit }: SelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValue } = useSelectField();
  const [searchFilter, setSearchFilter] = useState('');

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );
  const optionsToSelect =
    fieldDefinition.metadata.options.filter((option) => {
      return option.value !== fieldValue && option.label.includes(searchFilter);
    }) || [];
  const optionsInDropDown = selectedOption
    ? [selectedOption, ...optionsToSelect]
    : optionsToSelect;

  return (
    <StyledRelationPickerContainer>
      <DropdownMenu data-select-disable>
        <DropdownMenuSearchInput
          value={searchFilter}
          onChange={(event) => setSearchFilter(event.currentTarget.value)}
          autoFocus
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {optionsInDropDown.map((option) => {
            return (
              <MenuItemSelectTag
                selected={option.value === fieldValue}
                text={option.label}
                color={option.color}
                onClick={() => onSubmit?.(() => persistField(option.value))}
              />
            );
          })}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledRelationPickerContainer>
  );
};
