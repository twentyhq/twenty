import styled from '@emotion/styled';
import { MouseEvent, useMemo, useRef, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

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
  dropdownWidth?: number;
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
  dropdownOffset?: DropdownOffset;
  hasRightElement?: boolean;
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
  dropdownOffset,
  hasRightElement,
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

  const selectableItemIdArray = filteredOptions.map((option) => option.label);

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    dropdownId,
  );

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
          hasRightElement={hasRightElement}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownWidth={dropDownMenuWidth}
          dropdownPlacement="bottom-start"
          dropdownOffset={dropdownOffset}
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
              hasRightElement={hasRightElement}
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
                <DropdownMenuItemsContainer hasMaxHeight width={'auto'}>
                  <SelectableList
                    hotkeyScope={SelectHotkeyScope.Select}
                    selectableListInstanceId={dropdownId}
                    selectableItemIdArray={selectableItemIdArray}
                  >
                    {filteredOptions.map((option) => (
                      <SelectableListItem
                        key={`${option.value}-${option.label}`}
                        itemId={option.label}
                        onEnter={() => {
                          onChange?.(option.value);
                          onBlur?.();
                          closeDropdown();
                        }}
                      >
                        <MenuItemSelect
                          LeftIcon={option.Icon}
                          text={option.label}
                          selected={selectedOption.value === option.value}
                          focused={selectedItemId === option.label}
                          needIconCheck={needIconCheck}
                          onClick={() => {
                            onChange?.(option.value);
                            onBlur?.();
                            closeDropdown();
                          }}
                        />
                      </SelectableListItem>
                    ))}
                  </SelectableList>
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
