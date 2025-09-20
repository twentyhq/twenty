import { useMemo, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

import { AddSelectOptionMenuItem } from '@/settings/data-model/fields/forms/select/components/AddSelectOptionMenuItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemMultiSelectTag } from 'twenty-ui/navigation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiSelectInputProps = {
  selectableListComponentInstanceId: string;
  values: FieldMultiSelectValue;
  focusId: string;
  onCancel?: () => void;
  options: SelectOption[];
  onOptionSelected: (value: FieldMultiSelectValue) => void;
  dropdownWidth?: number;
  onAddSelectOption?: (optionName: string) => void;
};

export const MultiSelectInput = ({
  selectableListComponentInstanceId,
  values,
  options,
  focusId,
  onCancel,
  onOptionSelected,
  dropdownWidth,
  onAddSelectOption,
}: MultiSelectInputProps) => {
  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    selectableListComponentInstanceId,
  );

  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((option) =>
    values?.includes(option.value),
  );

  const filteredOptionsInDropDown = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return options.filter((option) => {
      return normalizeSearchText(option.label).includes(searchTerm);
    });
  }, [options, searchFilter]);

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

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      onCancel?.();
      resetSelectedItem();
    },
    focusId,
    dependencies: [onCancel, resetSelectedItem],
  });

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
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
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={optionIds}
      focusId={focusId}
    >
      <DropdownContent
        ref={containerRef}
        selectDisabled
        widthInPixels={dropdownWidth}
      >
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
          {filteredOptionsInDropDown.length === 0 ? (
            <MenuItem text={t`No option found`} />
          ) : (
            filteredOptionsInDropDown.map((option) => {
              return (
                <SelectableListItem
                  key={option.value}
                  itemId={option.value}
                  onEnter={() => {
                    onOptionSelected(formatNewSelectedOptions(option.value));
                  }}
                >
                  <MenuItemMultiSelectTag
                    key={option.value}
                    selected={values?.includes(option.value) || false}
                    text={option.label}
                    color={option.color ?? 'transparent'}
                    Icon={option.Icon ?? undefined}
                    onClick={() =>
                      onOptionSelected(formatNewSelectedOptions(option.value))
                    }
                    isKeySelected={selectedItemId === option.value}
                  />
                </SelectableListItem>
              );
            })
          )}
        </DropdownMenuItemsContainer>
        {onAddSelectOption &&
          searchFilter &&
          filteredOptionsInDropDown.length === 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <AddSelectOptionMenuItem
                  name={searchFilter}
                  onAddSelectOption={onAddSelectOption}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
      </DropdownContent>
    </SelectableList>
  );
};
