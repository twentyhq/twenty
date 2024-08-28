import styled from '@emotion/styled';

import { SelectOption } from '@/spreadsheet-import/types';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItemSelectTag } from '@/ui/navigation/menu-item/components/MenuItemSelectTag';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useTheme } from '@emotion/react';
import {
  ReferenceType,
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { TagColor, isDefined } from 'twenty-ui';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

interface SelectInputProps {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  onCancel?: () => void;
  defaultOption?: SelectOption;
  parentRef?: ReferenceType | null | undefined;
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
  parentRef,
  onFilterChange,
  hotkeyScope,
}: SelectInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
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

  const { refs, floatingStyles } = useFloating({
    elements: { reference: parentRef },
    strategy: 'absolute',
    middleware: [
      offset(() => {
        return parseInt(theme.spacing(2), 10);
      }),
      flip(),
      size(),
    ],
    whileElementsMounted: autoUpdate,
    open: true,
    placement: 'bottom-start',
  });

  useEffect(() => {
    onFilterChange?.(optionsInDropDown);
  }, [onFilterChange, optionsInDropDown]);

  useListenClickOutside({
    refs: [refs.floating],
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
    <StyledRelationPickerContainer
      ref={refs.setFloating}
      style={floatingStyles}
    >
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
              variant="outline"
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
                color={option.color as TagColor}
                onClick={() => handleOptionChange(option)}
              />
            );
          })}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledRelationPickerContainer>
  );
};
