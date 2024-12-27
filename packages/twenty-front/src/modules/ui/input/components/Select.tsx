import styled from '@emotion/styled';
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { IconComponent, MenuItem, MenuItemSelect } from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { SelectControl } from '@/ui/input/components/SelectControl';
import { isDefined } from '~/utils/isDefined';
import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

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
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownId: string;
  dropdownWidth?: `${string}px` | 'auto' | number;
  dropdownWidthAuto?: boolean;
  emptyOption?: SelectOption<Value>;
  fullWidth?: boolean;
  label?: string;
  onChange?: (value: Value) => void;
  onBlur?: () => void;
  options: SelectOption<Value>[];
  value?: Value;
  withSearchInput?: boolean;
  needIconCheck?: boolean;
  callToActionButton?: CallToActionButton;
};

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
  className,
  disabled: disabledFromProps,
  selectSizeVariant,
  dropdownId,
  dropdownWidth = 176,
  dropdownWidthAuto = false,
  emptyOption,
  fullWidth,
  label,
  onChange,
  onBlur,
  options,
  value,
  withSearchInput,
  needIconCheck,
  callToActionButton,
}: SelectProps<Value>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const selectedOption =
    options.find(({ value: key }) => key === value) ||
    emptyOption ||
    options[0];
  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : options,
    [options, searchInputValue],
  );

  const isDisabled =
    disabledFromProps ||
    (options.length <= 1 &&
      !isDefined(callToActionButton) &&
      (!isDefined(emptyOption) || selectedOption !== emptyOption));

  const { closeDropdown } = useDropdown(dropdownId);

  const dropDownMenuWidth =
    dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : dropdownWidth;

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={onBlur}
      ref={selectContainerRef}
    >
      {!!label && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          selectedOption={selectedOption}
          isDisabled={isDisabled}
          selectSizeVariant={selectSizeVariant}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownMenuWidth={dropDownMenuWidth}
          dropdownPlacement="bottom-start"
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
            />
          }
          dropdownComponents={
            <>
              {!!withSearchInput && (
                <DropdownMenuSearchInput
                  autoFocus
                  value={searchInputValue}
                  onChange={(event) => setSearchInputValue(event.target.value)}
                />
              )}
              {!!withSearchInput && !!filteredOptions.length && (
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
                      needIconCheck={needIconCheck}
                      onClick={() => {
                        onChange?.(option.value);
                        onBlur?.();
                        closeDropdown();
                      }}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              )}
              {!!callToActionButton && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!callToActionButton && (
                <DropdownMenuItemsContainer hasMaxHeight scrollable={false}>
                  <MenuItem
                    onClick={callToActionButton.onClick}
                    LeftIcon={callToActionButton.Icon}
                    text={callToActionButton.text}
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
