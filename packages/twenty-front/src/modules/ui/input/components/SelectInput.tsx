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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type TagColor } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelectTag } from 'twenty-ui/navigation';
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

  // Get the SelectableList instance id from context
  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(defaultOption);

  const optionsToSelect = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return (
      options.filter((option) => {
        return (
          option.value !== selectedOption?.value &&
          normalizeSearchText(option.label).includes(searchTerm)
        );
      }) || []
    );
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
            <MenuItemSelectTag
              key={t`No ${clearLabel}`}
              text={t`No ${clearLabel}`}
              color="transparent"
              variant="outline"
              onClick={handleClearOption}
              isKeySelected={selectedItemId === t`No ${clearLabel}`}
            />
          </SelectableListItem>
        )}
        {optionsInDropDown.map((option) => {
          return (
            <SelectableListItem
              key={option.value}
              itemId={option.value}
              onEnter={() => handleOptionChange(option)}
            >
              <MenuItemSelectTag
                key={option.value}
                selected={selectedOption?.value === option.value}
                text={option.label}
                color={(option.color as TagColor) ?? 'transparent'}
                onClick={() => handleOptionChange(option)}
                LeftIcon={option.Icon}
                isKeySelected={selectedItemId === option.value}
              />
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
