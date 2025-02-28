import styled from '@emotion/styled';
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { IconComponent, MenuItem, MenuItemSelect } from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { SelectControl } from '@/ui/input/components/SelectControl';
import { isDefined } from 'twenty-shared';
import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

import { SelectObject, StrategyType } from './SelectStrategy';

export type SelectOption<Value extends string | number | boolean | null> = {
  value: Value;
  label: string;
  Icon?: IconComponent;
};

export type SelectSizeVariant = 'small' | 'default';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export type SelectValue = string | number | boolean | null;

export type SelectProps<Value extends SelectValue> = {
  strategy: SelectObject<Value>;
}

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const Select = <Value extends SelectValue>({
  strategy
}: SelectProps<Value>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const selectedOption =
    strategy.options.find(({ value: key }) => key === strategy.value) ||
    strategy.emptyOption ||
    strategy.options[0];
  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? strategy.options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : strategy.options,
    [strategy.options, searchInputValue],
  );

  const isDisabled =
  strategy.disabled ||
    (strategy.options.length <= 1 &&
      !isDefined(strategy.callToActionButton) &&
      (!isDefined(strategy.emptyOption) || selectedOption !== strategy.emptyOption));

  const { closeDropdown } = useDropdown(strategy.dropdownId);

  const dropDownMenuWidth =
  strategy.dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : strategy.dropdownWidth;

  return (
    <StyledContainer
      className={strategy.className}
      fullWidth={strategy.fullWidth}
      tabIndex={0}
      onBlur={strategy.onBlur}
      ref={selectContainerRef}
    >
      {!!strategy.label && <StyledLabel>{strategy.label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          selectedOption={selectedOption}
          isDisabled={isDisabled}
          selectSizeVariant={strategy.selectSizeVariant}
        />
      ) : (
        <Dropdown
          dropdownId={strategy.dropdownId}
          dropdownMenuWidth={dropDownMenuWidth}
          dropdownPlacement="bottom-start"
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={strategy.selectSizeVariant}
            />
          }
          dropdownComponents={
            <>
              {!!strategy.withSearchInput && (
                <DropdownMenuSearchInput
                  autoFocus
                  value={searchInputValue}
                  onChange={(event) => setSearchInputValue(event.target.value)}
                />
              )}
              {!!strategy.withSearchInput && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!filteredOptions.length && (
                <DropdownMenuItemsContainer hasMaxHeight>
                  {filteredOptions.map((option) => (
                    <MenuItemSelect
                      key={`${option.value}-${option.label}`}
                      LeftIcon={option.Icon}
                      text={option.label}
                      selected={selectedOption.value === option.value}
                      needIconCheck={strategy.needIconCheck}
                      onClick={() => {
                        strategy.onChange?.(option.value);
                        strategy.onBlur?.();
                        closeDropdown();
                      }}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              )}
              {!!strategy.callToActionButton && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!strategy.callToActionButton && (
                <DropdownMenuItemsContainer hasMaxHeight scrollable={false}>
                  <MenuItem
                    onClick={strategy.callToActionButton.onClick}
                    LeftIcon={strategy.callToActionButton.Icon}
                    text={strategy.callToActionButton.text}
                  />
                </DropdownMenuItemsContainer>
              )}
            </>
          }
          dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
        />
      )}
    </StyledContainer>
  );
};
