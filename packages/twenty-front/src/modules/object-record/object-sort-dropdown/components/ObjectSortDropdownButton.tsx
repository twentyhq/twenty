import { useState } from 'react';
import styled from '@emotion/styled';
import { IconChevronDown, useIcons } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useObjectSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useObjectSortDropdown';
import { ObjectSortDropdownScope } from '@/object-record/object-sort-dropdown/scopes/ObjectSortDropdownScope';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { SORT_DIRECTIONS } from '../types/SortDirection';

export const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 20px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

//width: ${({ theme }) => `calc(100% - ${theme.spacing(10)})`};
//font-size: ${({ theme }) => theme.font.size.sm};

export type ObjectSortDropdownButtonProps = {
  sortDropdownId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
  sortDropdownId,
  hotkeyScope,
}: ObjectSortDropdownButtonProps) => {
  const [searchText, setSearchText] = useState('');

  const {
    isSortDirectionMenuUnfolded,
    setIsSortDirectionMenuUnfolded,
    selectedSortDirection,
    setSelectedSortDirection,
    toggleSortDropdown,
    resetState,
    isSortSelected,
    availableSortDefinitions,
    handleAddSort,
  } = useObjectSortDropdown();

  const handleButtonClick = () => {
    toggleSortDropdown();
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  const { getIcon } = useIcons();

  const debouncedSetSearchFilter = useDebouncedCallback(setSearchText, 100, {
    leading: true,
  });
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchFilter(event.target.value);
  };

  return (
    <ObjectSortDropdownScope sortScopeId={sortDropdownId}>
      <Dropdown
        dropdownId={OBJECT_SORT_DROPDOWN_ID}
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ y: 8 }}
        clickableComponent={
          <LightButton
            title="Sort"
            active={isSortSelected}
            onClick={handleButtonClick}
          />
        }
        dropdownComponents={
          <>
            {isSortDirectionMenuUnfolded ? (
              <DropdownMenuItemsContainer>
                {SORT_DIRECTIONS.map((sortOrder, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      setSelectedSortDirection(sortOrder);
                      setIsSortDirectionMenuUnfolded(false);
                    }}
                    text={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  />
                ))}
              </DropdownMenuItemsContainer>
            ) : (
              <>
                <DropdownMenuHeader
                  EndIcon={IconChevronDown}
                  onClick={() => setIsSortDirectionMenuUnfolded(true)}
                >
                  {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </DropdownMenuHeader>
                <StyledInput
                  value={searchText}
                  placeholder="Search fields"
                  onChange={handleSearchChange}
                />
                <DropdownMenuItemsContainer>
                  {[...availableSortDefinitions]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .filter((item) =>
                      item.label
                        .toLocaleLowerCase()
                        .includes(searchText.toLocaleLowerCase()),
                    )
                    .map((availableSortDefinition, index) => (
                      <MenuItem
                        testId={`select-sort-${index}`}
                        key={index}
                        onClick={() => {
                          setSearchText('');
                          handleAddSort(availableSortDefinition);
                        }}
                        LeftIcon={getIcon(availableSortDefinition.iconName)}
                        text={availableSortDefinition.label}
                      />
                    ))}
                </DropdownMenuItemsContainer>
              </>
            )}
          </>
        }
        onClose={handleDropdownButtonClose}
      />
    </ObjectSortDropdownScope>
  );
};
