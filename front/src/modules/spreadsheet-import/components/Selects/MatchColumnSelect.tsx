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
import { TablerIconsProps } from '@tabler/icons-react';
import debounce from 'lodash.debounce';
import { ReadonlyDeep } from 'type-fest';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { IconChevronDown } from '@/ui/icon';
import { AppTooltip } from '@/ui/tooltip/AppTooltip';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

import type { SelectOption } from '../../types';

const DropdownItem = styled.div`
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

const DropdownLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const FloatingDropdown = styled.div`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

interface Props {
  onChange: (value: ReadonlyDeep<SelectOption> | null) => void;
  value?: ReadonlyDeep<SelectOption>;
  options: ReadonlyDeep<SelectOption>[];
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

  function renderIcon(icon: ReadonlyDeep<React.ReactNode>) {
    if (icon && React.isValidElement(icon)) {
      return React.cloneElement<TablerIconsProps>(icon as any, {
        size: 16,
        color: theme.font.color.primary,
      });
    }
    return null;
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

  console.log('options 2: ', options);

  return (
    <>
      <DropdownItem
        ref={(node) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          dropdownItemRef.current = node;
          refs.setReference(node);
        }}
        onClick={handleDropdownItemClick}
      >
        {renderIcon(value?.icon)}
        <DropdownLabel>{value?.label}</DropdownLabel>
        <IconChevronDown size={16} color={theme.font.color.tertiary} />
      </DropdownItem>
      {isOpen && (
        <FloatingDropdown ref={refs.setFloating} style={floatingStyles}>
          <DropdownMenu
            ref={dropdownContainerRef}
            width={dropdownItemRef.current?.clientWidth}
          >
            <DropdownMenuSearch
              value={searchFilter}
              onChange={handleFilterChange}
              autoFocus
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              {options?.map((option) => (
                <>
                  <DropdownMenuSelectableItem
                    id={option.value}
                    key={option.label}
                    selected={value?.label === option.label}
                    onClick={() => handleChange(option)}
                    disabled={option.disabled && value?.value !== option.value}
                  >
                    {renderIcon(option?.icon)}
                    {option.label}
                  </DropdownMenuSelectableItem>
                  {option.disabled &&
                    value?.value !== option.value &&
                    createPortal(
                      <AppTooltip
                        anchorSelect={`#${option.value}`}
                        content="You are already importing this column."
                        place="right"
                        offset={-20}
                      />,
                      document.body,
                    )}
                </>
              ))}
              {options?.length === 0 && (
                <DropdownMenuItem>No result</DropdownMenuItem>
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        </FloatingDropdown>
      )}
    </>
  );
};
