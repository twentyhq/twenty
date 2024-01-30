import styled from '@emotion/styled';
import { MenuItem } from 'tsup.ui.index';

import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type SelectFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const SelectFieldInput = ({ onSubmit }: SelectFieldInputProps) => {
  const { persistField, fieldDefinition } = useSelectField();

  return (
    <StyledRelationPickerContainer>
      <DropdownMenu data-select-disable>
        <DropdownMenuItemsContainer>
          {fieldDefinition.metadata.options.map((option) => {
            return (
              <MenuItem
                text={option.label}
                onClick={() => onSubmit?.(() => persistField(option.value))}
              />
            );
          })}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledRelationPickerContainer>
  );
};
