import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import debounce from 'lodash.debounce';
import { ReadonlyDeep } from 'type-fest';

import type { SelectOption } from '@/spreadsheet-import/types';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/menu-item/components/MenuItemSelect';
import { AppTooltip } from '@/ui/tooltip/AppTooltip';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

const StyledDropdownItem = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: 32px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledDropdownLabel = styled.span<{ isPlaceholder: boolean }>`
  color: ${({ theme, isPlaceholder }) =>
    isPlaceholder ? theme.font.color.tertiary : theme.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledFloatingDropdown = styled.div`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

interface Props {
  onChange: (value: ReadonlyDeep<SelectOption> | null) => void;
  value?: ReadonlyDeep<SelectOption>;
  options: readonly ReadonlyDeep<SelectOption>[];
  placeholder?: string;
  name?: string;
}

export const MatchColumnSelect = ({
  onChange,
  value,
  options: initialOptions,
  placeholder,
  name,
}: Props) => {
  const theme = useTheme();

  const dropdownItemRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [options, setOptions] = useState(initialOptions);

  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [
      offset(() => {
        return parseInt(theme.spacing(2), 10);
      }),
      flip(),
      size(),
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    placement: 'bottom-start',
  });

  const handleSearchFilterChange = useCallback(
    (text: string) => {
      setOptions(
        initialOptions.filter((option) => option.label.includes(text)),
      );
    },
    [initialOptions],
  );

  const debouncedHandleSearchFilter = debounce(handleSearchFilterChange, 100, {
    leading: true,
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;

    setSearchFilter(value);
    debouncedHandleSearchFilter(value);
  }

  function handleDropdownItemClick() {
    setIsOpen(true);
  }

  function handleChange(option: ReadonlyDeep<SelectOption>) {
    onChange(option);
    setIsOpen(false);
  }

  useListenClickOutside({
    refs: [dropdownContainerRef],
    callback: () => {
      setIsOpen(false);
    },
  });

  useUpdateEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  return (
    <>
      <div ref={refs.setReference}>
        <MenuItem
          LeftIcon={value?.icon}
          onClick={handleDropdownItemClick}
          text={value?.label ?? placeholder ?? ''}
          accent={value?.label ? 'default' : 'placeholder'}
        />
      </div>
      {isOpen &&
        createPortal(
          <StyledFloatingDropdown ref={refs.setFloating} style={floatingStyles}>
            <StyledDropdownMenu
              ref={dropdownContainerRef}
              width={refs.domReference.current?.clientWidth}
            >
              <DropdownMenuInput
                value={searchFilter}
                onChange={handleFilterChange}
                autoFocus
              />
              <StyledDropdownMenuSeparator />
              <StyledDropdownMenuItemsContainer hasMaxHeight>
                {options?.map((option) => (
                  <>
                    <MenuItemSelect
                      key={option.label}
                      selected={value?.label === option.label}
                      onClick={() => handleChange(option)}
                      disabled={
                        option.disabled && value?.value !== option.value
                      }
                      LeftIcon={option?.icon}
                      text={option.label}
                    />
                    {option.disabled &&
                      value?.value !== option.value &&
                      createPortal(
                        <AppTooltip
                          key={option.value}
                          anchorSelect={`#${option.value}`}
                          content="You are already importing this column."
                          place="right"
                          offset={-20}
                        />,
                        document.body,
                      )}
                  </>
                ))}
                {options?.length === 0 && <MenuItem text="No result" />}
              </StyledDropdownMenuItemsContainer>
            </StyledDropdownMenu>
          </StyledFloatingDropdown>,
          document.body,
        )}
    </>
  );
};
