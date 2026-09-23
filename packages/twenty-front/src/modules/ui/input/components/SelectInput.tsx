import { AddSelectOptionMenuItem } from '@/settings/data-model/fields/forms/select/components/AddSelectOptionMenuItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type TagColor, Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

interface SelectInputProps {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  onCancel?: () => void;
  defaultOption?: SelectOption;
  onFilterChange?: (filteredOptions: SelectOption[]) => void;
  onClear?: () => void;
  clearLabel?: string;
  focusId: string;
  onAddSelectOption?: (optionName: string) => void;
}

export const SelectInput = ({
  onOptionSelected,
  onClear,
  clearLabel,
  options,
  onCancel,
  defaultOption,
  onFilterChange,
  onAddSelectOption,
}: SelectInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(defaultOption);

  const optionsToSelect = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return options.filter((option) => {
      return (
        option.value !== selectedOption?.value &&
        normalizeSearchText(option.label).includes(searchTerm)
      );
    });
  }, [options, searchFilter, selectedOption?.value]);

  const optionsInDropDown = useMemo(
    () =>
      selectedOption ? [selectedOption, ...optionsToSelect] : optionsToSelect,
    [optionsToSelect, selectedOption],
  );

  const handleOptionChange = (option: SelectOption) => {
    setSelectedOption(option);
    onOptionSelected(option);
  };

  const handleClearOption = () => {
    setSelectedOption(undefined);
    onClear?.();
  };

  useEffect(() => {
    onFilterChange?.(optionsInDropDown);
  }, [onFilterChange, optionsInDropDown]);

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
    },
    listenerId: 'select-input',
  });

  return (
    <DropdownContent ref={containerRef} selectDisabled>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {onClear && clearLabel && (
          <SelectableListItem
            itemId={t`No ${clearLabel}`}
            onEnter={handleClearOption}
          >
            <ListItem
              key={t`No ${clearLabel}`}
              onClick={handleClearOption}
              focused={selectedItemId === t`No ${clearLabel}`}
              role="option"
              aria-selected={false}
              selected={false}
              indicator="check"
            >
              <Tag
                color={'transparent'}
                borderStyle="dashed"
                variant={'outline'}
              >{t`No ${clearLabel}`}</Tag>
            </ListItem>
          </SelectableListItem>
        )}
        {optionsInDropDown.map((option) => {
          return (
            <SelectableListItem
              key={option.value}
              itemId={option.value}
              onEnter={() => handleOptionChange(option)}
            >
              <ListItem
                key={option.value}
                onClick={() => handleOptionChange(option)}
                focused={selectedItemId === option.value}
                role="option"
                aria-selected={selectedOption?.value === option.value}
                selected={selectedOption?.value === option.value}
                indicator="check"
              >
                <Tag
                  color={(option.color as TagColor) ?? 'transparent'}
                  borderStyle="dashed"
                  variant={'soft'}
                  startIcon={
                    isDefined(option.Icon)
                      ? createElement(option.Icon)
                      : undefined
                  }
                >
                  {option.label}
                </Tag>
              </ListItem>
            </SelectableListItem>
          );
        })}
      </DropdownMenuItemsContainer>
      {onAddSelectOption && searchFilter && optionsToSelect.length === 0 && (
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
  );
};
