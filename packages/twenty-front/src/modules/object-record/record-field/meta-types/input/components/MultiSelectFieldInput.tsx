import { useRef, useState } from 'react';
import styled from '@emotion/styled';

import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItemMultiSelectTag } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectTag';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type MultiSelectFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const MultiSelectFieldInput = ({
  onCancel,
}: MultiSelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValues } = useMultiSelectField();
  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = fieldDefinition.metadata.options.filter(
    (option) => fieldValues?.includes(option.value),
  );

  const optionsInDropDown = fieldDefinition.metadata.options;

  const formatNewSelectedOptions = (value: string) => {
    const selectedOptionsValues = selectedOptions.map(
      (selectedOption) => selectedOption.value,
    );
    if (!selectedOptionsValues.includes(value)) {
      return [value, ...selectedOptionsValues];
    } else {
      return selectedOptionsValues.filter(
        (selectedOptionsValue) => selectedOptionsValue !== value,
      );
    }
  };

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
              <MenuItemMultiSelectTag
                key={option.value}
                selected={fieldValues?.includes(option.value) || false}
                text={option.label}
                color={option.color}
                onClick={() =>
                  persistField(formatNewSelectedOptions(option.value))
                }
              />
            );
          })}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledRelationPickerContainer>
  );
};
