import styled from '@emotion/styled';
import { MenuItem } from 'tsup.ui.index';

import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItemSelectOption } from '@/ui/navigation/menu-item/components/MenuItemSelectOption';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { useSelectFieldSearch } from '../hooks/useSelectFieldSearch';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type SelectFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const SelectFieldInput = ({ onSubmit }: SelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValue} = useSelectField();
  const {searchFilter, handleSearchFilterChange} = useSelectFieldSearch();


  const selectedOption = fieldDefinition.metadata.options.find((option)=>option.value==fieldValue);
  const optionsToSelect = fieldDefinition.metadata.options.filter((option)=>{
                            return option.value != fieldValue && option.label.includes(searchFilter)
                          }) || [];
  const optionsInDropDown = selectedOption ?[selectedOption,...optionsToSelect] : optionsToSelect;

  return (
    <StyledRelationPickerContainer>
      <DropdownMenu data-select-disable>
        <DropdownMenuSearchInput
          value={searchFilter}
          onChange={handleSearchFilterChange}
          autoFocus
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {optionsInDropDown.map((option) => {
            return (
              <MenuItemSelectOption
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
