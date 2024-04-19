import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
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

export const ObjectFilterDropdownFilterSelect = () => {
  const [searchText, setSearchText] = useState('');
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    availableFilterDefinitionsState,
  } = useFilterDropdown();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );

  const { getIcon } = useIcons();

  const setHotkeyScope = useSetHotkeyScope();

  const debouncedSetSearchFilter = useDebouncedCallback(setSearchText, 100, {
    leading: true,
  });
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchFilter(event.target.value);
  };

  return (
    <>
      <StyledInput
        value={searchText}
        placeholder="Search fields"
        onChange={handleSearchChange}
      />
      <DropdownMenuItemsContainer>
        {[...availableFilterDefinitions]
          .sort((a, b) => a.label.localeCompare(b.label))
          .filter((item) =>
            item.label
              .toLocaleLowerCase()
              .includes(searchText.toLocaleLowerCase()),
          )
          .map((availableFilterDefinition, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              onClick={() => {
                setFilterDefinitionUsedInDropdown(availableFilterDefinition);

                if (availableFilterDefinition.type === 'RELATION') {
                  setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
                }

                setSelectedOperandInDropdown(
                  getOperandsForFilterType(availableFilterDefinition.type)?.[0],
                );

                setObjectFilterDropdownSearchInput('');
              }}
              LeftIcon={getIcon(availableFilterDefinition.iconName)}
              text={availableFilterDefinition.label}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
