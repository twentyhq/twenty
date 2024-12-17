import { SelectOption } from '@/spreadsheet-import/types';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { MenuItemSelectTag, TagColor, isDefined } from 'twenty-ui';

interface SelectInputProps {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  onCancel?: () => void;
  defaultOption?: SelectOption;
  onFilterChange?: (filteredOptions: SelectOption[]) => void;
  onClear?: () => void;
  clearLabel?: string;
  hotkeyScope: string;
}

export const SelectInput = ({
  onOptionSelected,
  onClear,
  clearLabel,
  options,
  onCancel,
  defaultOption,
  onFilterChange,
  hotkeyScope,
}: SelectInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(defaultOption);

  const optionsToSelect = useMemo(
    () =>
      options.filter((option) => {
        return (
          option.value !== selectedOption?.value &&
          option.label.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }) || [],
    [options, searchFilter, selectedOption?.value],
  );

  const optionsInDropDown = useMemo(
    () =>
      selectedOption ? [selectedOption, ...optionsToSelect] : optionsToSelect,
    [optionsToSelect, selectedOption],
  );

  const handleOptionChange = (option: SelectOption) => {
    setSelectedOption(option);
    onOptionSelected(option);
  };

  useEffect(() => {
    onFilterChange?.(optionsInDropDown);
  }, [onFilterChange, optionsInDropDown]);

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
    listenerId: 'select-input',
  });

  useScopedHotkeys(
    Key.Enter,
    () => {
      const selectedOption = optionsInDropDown.find((option) =>
        option.label.toLowerCase().includes(searchFilter.toLowerCase()),
      );
      if (isDefined(selectedOption)) {
        handleOptionChange(selectedOption);
      }
    },
    hotkeyScope,
    [searchFilter, optionsInDropDown],
  );

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {onClear && clearLabel && (
          <MenuItemSelectTag
            key={`No ${clearLabel}`}
            selected={false}
            text={`No ${clearLabel}`}
            color="transparent"
            variant={'outline'}
            onClick={() => {
              setSelectedOption(undefined);
              onClear();
            }}
          />
        )}
        {optionsInDropDown.map((option) => {
          return (
            <MenuItemSelectTag
              key={option.value}
              selected={selectedOption?.value === option.value}
              text={option.label}
              color={(option.color as TagColor) ?? 'transparent'}
              onClick={() => handleOptionChange(option)}
              LeftIcon={option.icon}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
