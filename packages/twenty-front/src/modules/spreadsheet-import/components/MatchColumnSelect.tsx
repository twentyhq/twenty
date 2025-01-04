import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltip, MenuItem, MenuItemSelect } from 'twenty-ui';
import { ReadonlyDeep } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

import { SelectOption } from '@/spreadsheet-import/types';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

const StyledFloatingDropdown = styled.div`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

interface MatchColumnSelectProps {
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
}: MatchColumnSelectProps) => {
  const theme = useTheme();

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
        initialOptions.filter((option) =>
          option.label.toLowerCase().includes(text.toLowerCase()),
        ),
      );
    },
    [initialOptions],
  );

  const debouncedHandleSearchFilter = useDebouncedCallback(
    handleSearchFilterChange,
    100,
    {
      leading: true,
    },
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchFilter(value);
    debouncedHandleSearchFilter(value);
  };

  const handleDropdownItemClick = () => {
    setIsOpen(true);
  };

  const handleChange = (option: ReadonlyDeep<SelectOption>) => {
    onChange(option);
    setIsOpen(false);
  };

  useListenClickOutside({
    refs: [dropdownContainerRef],
    callback: () => {
      setIsOpen(false);
    },
    listenerId: 'match-column-select',
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
            <OverlayContainer>
              <DropdownMenu
                data-select-disable
                ref={dropdownContainerRef}
                // width={refs.domReference.current?.clientWidth}
              >
                <DropdownMenuSearchInput
                  value={searchFilter}
                  onChange={handleFilterChange}
                  autoFocus
                />
                <DropdownMenuSeparator />
                <DropdownMenuItemsContainer hasMaxHeight>
                  {options?.map((option) => (
                    <React.Fragment key={option.label}>
                      <MenuItemSelect
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
                    </React.Fragment>
                  ))}
                  {options?.length === 0 && (
                    <MenuItem key="No result" text="No result" />
                  )}
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            </OverlayContainer>
          </StyledFloatingDropdown>,
          document.body,
        )}
    </>
  );
};
