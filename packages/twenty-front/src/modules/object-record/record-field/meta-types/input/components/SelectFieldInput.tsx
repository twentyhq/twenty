import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { SINGLE_ENTITY_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleEntitySelectBaseList';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemSelectTag } from '@/ui/navigation/menu-item/components/MenuItemSelectTag';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
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
  const { persistField, fieldDefinition, fieldValue, hotkeyScope } =
    useSelectField();
  const { selectedItemIdState } = useSelectableListStates({
    selectableListScopeId: SINGLE_ENTITY_SELECT_BASE_LIST,
  });
  const { handleResetSelectedPosition } = useSelectableList(
    SINGLE_ENTITY_SELECT_BASE_LIST,
  );
  const clearField = useClearField();

  const selectedItemId = useRecoilValue(selectedItemIdState);
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

  // handlers
  const handleClearField = () => {
    clearField();
    onCancel?.();
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
        handleResetSelectedPosition();
      }
    },
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
      handleResetSelectedPosition();
    },
    hotkeyScope,
    [onCancel, handleResetSelectedPosition],
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      const selectedOption = optionsInDropDown.find((option) =>
        option.label.toLowerCase().includes(searchFilter.toLowerCase()),
      );

      if (isDefined(selectedOption)) {
        onSubmit?.(() => persistField(selectedOption.value));
      }
      handleResetSelectedPosition();
    },
    hotkeyScope,
  );

  const optionIds = [
    `No ${fieldDefinition.label}`,
    ...optionsInDropDown.map((option) => option.value),
  ];

  return (
    <SelectableList
      selectableListId={SINGLE_ENTITY_SELECT_BASE_LIST}
      selectableItemIdArray={optionIds}
      hotkeyScope={hotkeyScope}
      onEnter={(itemId) => {
        const option = optionsInDropDown.find(
          (option) => option.value === itemId,
        );
        if (isDefined(option)) {
          onSubmit?.(() => persistField(option.value));
          handleResetSelectedPosition();
        }
      }}
    >
      <StyledRelationPickerContainer ref={containerRef}>
        <DropdownMenu data-select-disable>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.currentTarget.value)}
            autoFocus
          />
          <DropdownMenuSeparator />

          <DropdownMenuItemsContainer hasMaxHeight>
            {fieldDefinition.metadata.isNullable ?? (
              <MenuItemSelectTag
                key={`No ${fieldDefinition.label}`}
                selected={false}
                text={`No ${fieldDefinition.label}`}
                color="transparent"
                variant="outline"
                onClick={handleClearField}
                isKeySelected={selectedItemId === `No ${fieldDefinition.label}`}
              />
            )}

            {optionsInDropDown.map((option) => {
              return (
                <MenuItemSelectTag
                  key={option.value}
                  selected={option.value === fieldValue}
                  text={option.label}
                  color={option.color}
                  onClick={() => {
                    onSubmit?.(() => persistField(option.value));
                    handleResetSelectedPosition();
                  }}
                  isKeySelected={selectedItemId === option.value}
                />
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      </StyledRelationPickerContainer>
    </SelectableList>
  );
};
