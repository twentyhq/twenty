import { useRef, useState } from 'react';
import styled from '@emotion/styled';

import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItemSelectTag } from '@/ui/navigation/menu-item/components/MenuItemSelectTag';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type SelectFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const SelectFieldInput = ({
  onSubmit,
  onCancel,
}: SelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValue } = useSelectField();
  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );
  const optionsToSelect =
    fieldDefinition.metadata.options.filter((option) => {
      return (
        option.value !== fieldValue &&
        option.label.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }) || [];
  const optionsInDropDown = selectedOption
    ? [selectedOption, ...optionsToSelect]
    : optionsToSelect;

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();

      const weAreNotInAnHTMLInput = !(
        event.target instanceof HTMLInputElement &&
        event.target.tagName === 'INPUT'
      );
      if (weAreNotInAnHTMLInput && isDefined(onCancel)) {
        onCancel();
      }
    },
  });

  return (
    <StyledRelationPickerContainer ref={containerRef}>
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
                key={option.value}
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
