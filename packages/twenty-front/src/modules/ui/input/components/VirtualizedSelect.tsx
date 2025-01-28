import { SelectProps, SelectValue } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isDefined, MenuItem, MenuItemSelect } from 'twenty-ui';

interface VirtualizedSelectProps<T extends SelectValue> extends Omit<SelectProps<T>, 'dropdownComponents'> {
  itemHeight: number;
  maxHeight: number;
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

const StyledScrollContainer = styled.div<{ maxHeight: number }>`
  max-height: ${({ maxHeight }) => maxHeight}px;
  overflow-y: auto;
`;

export const VirtualizedSelect = <T extends SelectValue,>({
  className = '',
  disabled: disabledFromProps,
  fullWidth = false,
  label = '',
  options,
  itemHeight,
  maxHeight,
  value,
  onChange,
  dropdownId,
  dropdownWidth = 176,
  selectSizeVariant,
  needIconCheck,
  onBlur,
  callToActionButton,
  emptyOption,
  withSearchInput,
  dropdownWidthAuto,
}: VirtualizedSelectProps<T>) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const { closeDropdown } = useDropdown(dropdownId);

  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : options,
    [options, searchInputValue],
  );

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  useEffect(() => {
    if (isOpen && parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [isOpen, searchInputValue]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const isDisabled =
    disabledFromProps ||
    (options.length <= 1 &&
      !isDefined(callToActionButton) &&
      (!isDefined(emptyOption) || selectedOption !== emptyOption));

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
          onOpen={() => setIsOpen(true)}
          onClose={() => {
            setIsOpen(false);
            setSearchInputValue('');
          }}
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
            />
          }
          dropdownComponents={
            <>
              {withSearchInput && (
                <>
                  <DropdownMenuSearchInput
                    autoFocus
                    value={searchInputValue}
                    onChange={(event) => setSearchInputValue(event.target.value)}
                  />
                  <DropdownMenuSeparator />
                </>
              )}
              <StyledScrollContainer ref={parentRef} maxHeight={maxHeight}>
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const option = filteredOptions[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <MenuItemSelect
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
                      </div>
                    );
                  })}
                </div>
              </StyledScrollContainer>
              {callToActionButton && filteredOptions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItemsContainer hasMaxHeight={false} scrollable={false}>
                    <MenuItem
                      onClick={callToActionButton.onClick}
                      LeftIcon={callToActionButton.Icon}
                      text={callToActionButton.text}
                    />
                  </DropdownMenuItemsContainer>
                </>
              )}
            </>
          }
          dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
        />
      )}
    </StyledContainer>
  );
};