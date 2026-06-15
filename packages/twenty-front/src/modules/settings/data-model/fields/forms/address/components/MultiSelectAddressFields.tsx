import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { type SelectSizeVariant } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import { type MouseEvent, useMemo, useState } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemMultiSelectTag } from 'twenty-ui/navigation';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export type MultiSelectAddressFieldsProps<Value extends SelectValue> = {
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownId: string;
  dropdownWidth?: number;
  onChange?: (values: Value[]) => void;
  options: SelectOption<Value>[];
  values: Value[];
  callToActionButton?: CallToActionButton;
};

export const MultiSelectAddressFields = <Value extends SelectValue>({
  className: _className,
  selectSizeVariant,
  dropdownId,
  dropdownWidth = GenericDropdownContentWidth.Medium,
  onChange,
  options,
  values,
  callToActionButton,
}: MultiSelectAddressFieldsProps<Value>) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : options,
    [options, searchInputValue],
  );
  const onOptionSelected = (value: Value, values: Value[]) => {
    if (!values.includes(value)) {
      return [...values, value];
    } else {
      return values.filter((val) => val !== value);
    }
  };
  const selectableItemIdArray = filteredOptions.map((option) => option.label);
  const onCloseDropdown = () => {
    setSearchInputValue('');
  };
  return (
    <Dropdown
      dropdownId={dropdownId}
      onClose={onCloseDropdown}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label:
              values?.length === options.length
                ? t`Default`
                : values?.length.toString(),
            value: values?.length,
          }}
          selectSizeVariant={selectSizeVariant}
        />
      }
      dropdownComponents={
        <SelectableList
          selectableListInstanceId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
          focusId={dropdownId}
        >
          <DropdownContent selectDisabled widthInPixels={dropdownWidth}>
            <DropdownMenuSearchInput
              value={searchInputValue}
              onChange={(event) => setSearchInputValue(event.target.value)}
              autoFocus
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              {filteredOptions?.map((option) => {
                return (
                  <SelectableListItem
                    key={`${option.value}`}
                    itemId={`${option.value}`}
                    onEnter={() => {
                      onChange?.(onOptionSelected(option.value, values));
                    }}
                  >
                    <MenuItemMultiSelectTag
                      key={`${option.value}`}
                      selected={values?.includes(option?.value) || false}
                      text={option.label}
                      color="transparent"
                      onClick={() =>
                        onChange?.(onOptionSelected(option.value, values))
                      }
                    />
                  </SelectableListItem>
                );
              })}
            </DropdownMenuItemsContainer>
          </DropdownContent>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer hasMaxHeight scrollable={false}>
            <MenuItem
              onClick={callToActionButton?.onClick}
              LeftIcon={callToActionButton?.Icon}
              text={callToActionButton?.text}
              disabled={values.length === options.length}
            />
          </DropdownMenuItemsContainer>
        </SelectableList>
      }
    />
  );
};
