import { useCallback, useRef, useState } from 'react';
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

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/dropdown/components/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { IconChevronDown } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import type { SelectOption } from '../../types';

const DropdownItem = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
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
  onChange: (value: SelectOption | null) => void;
  value?: SelectOption;
  options: readonly SelectOption[];
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [options, setOptions] = useState(initialOptions);

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
    setSearchFilter(event.currentTarget.value);
    debouncedHandleSearchFilter(event.currentTarget.value);
  }

  function handleDropdownItemClick() {
    console.log('handleDropdownItemClick');
    setIsOpen(true);
  }

  const dropdownItemRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

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

  useListenClickOutside({
    refs: [dropdownContainerRef],
    callback: () => {
      setIsOpen(false);
    },
  });

  return (
    <>
      <div ref={refs.setReference}>
        <DropdownItem ref={dropdownItemRef} onClick={handleDropdownItemClick}>
          <DropdownLabel>{value?.label}</DropdownLabel>
          <IconChevronDown size={16} color={theme.font.color.tertiary} />
        </DropdownItem>
      </div>
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
                <DropdownMenuCheckableItem
                  key={option.label}
                  checked={false}
                  onChange={() => onChange(option)}
                >
                  {/** icon */}
                  {option.label}
                </DropdownMenuCheckableItem>
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
