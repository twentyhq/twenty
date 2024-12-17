import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { SelectOption } from '@/spreadsheet-import/types';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { MenuItemMultiSelectTag } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiSelectInputProps = {
  values: FieldMultiSelectValue;
  hotkeyScope: string;
  onCancel?: () => void;
  options: SelectOption[];
  onOptionSelected: (value: FieldMultiSelectValue) => void;
};

export const MultiSelectInput = ({
  values,
  options,
  hotkeyScope,
  onCancel,
  onOptionSelected,
}: MultiSelectInputProps) => {
  const { selectedItemIdState } = useSelectableListStates({
    selectableListScopeId: MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  });
  const { resetSelectedItem } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );

  const selectedItemId = useRecoilValue(selectedItemIdState);
  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((option) =>
    values?.includes(option.value),
  );

  const filteredOptionsInDropDown = options.filter((option) =>
    option.label.toLowerCase().includes(searchFilter.toLowerCase()),
  );

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

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
      resetSelectedItem();
    },
    hotkeyScope,
    [onCancel, resetSelectedItem],
  );

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
      resetSelectedItem();
    },
    listenerId: 'MultiSelectFieldInput',
  });

  const optionIds = filteredOptionsInDropDown.map((option) => option.value);

  return (
    <SelectableList
      selectableListId={MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID}
      selectableItemIdArray={optionIds}
      hotkeyScope={hotkeyScope}
      onEnter={(itemId) => {
        const option = filteredOptionsInDropDown.find(
          (option) => option.value === itemId,
        );
        if (isDefined(option)) {
          onOptionSelected(formatNewSelectedOptions(option.value));
        }
      }}
    >
      <DropdownMenu data-select-disable ref={containerRef}>
        <DropdownMenuSearchInput
          value={searchFilter}
          onChange={(event) =>
            setSearchFilter(
              turnIntoEmptyStringIfWhitespacesOnly(event.currentTarget.value),
            )
          }
          autoFocus
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {filteredOptionsInDropDown.map((option) => {
            return (
              <MenuItemMultiSelectTag
                key={option.value}
                selected={values?.includes(option.value) || false}
                text={option.label}
                color={option.color ?? 'transparent'}
                Icon={option.icon ?? undefined}
                onClick={() =>
                  onOptionSelected(formatNewSelectedOptions(option.value))
                }
                isKeySelected={selectedItemId === option.value}
              />
            );
          })}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </SelectableList>
  );
};
