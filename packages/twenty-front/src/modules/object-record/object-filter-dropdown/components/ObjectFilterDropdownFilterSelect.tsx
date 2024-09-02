import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useHandleClick } from '@/object-record/object-filter-dropdown/hooks/useHandleClick';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 19px;
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

  const { availableFilterDefinitionsState } = useFilterDropdown();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );

  const sortedAvailableFilterDefinitions = [...availableFilterDefinitions]
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((item) =>
      item.label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );
  const { handleClick } = useHandleClick();
  return (
    <>
      <StyledInput
        value={searchText}
        autoFocus
        placeholder="Search fields"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      />
      <SelectableList
        hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}
        selectableItemIdArray={sortedAvailableFilterDefinitions.map(
          (item) => item.fieldMetadataId,
        )}
        selectableListId={OBJECT_FILTER_DROPDOWN_ID}
        onEnter={(itemId) => {
          const selectedFilterDefinition =
            sortedAvailableFilterDefinitions.find(
              (item) => item.fieldMetadataId === itemId,
            );
          if (!selectedFilterDefinition) return;
          handleClick({ filterDefinition: selectedFilterDefinition });
        }}
      >
        <DropdownMenuItemsContainer>
          {sortedAvailableFilterDefinitions.map(
            (availableFilterDefinition, index) => (
              <ObjectFilterDropdownFilterSelectMenuItem
                key={`select-filter-${index}`}
                filterDefinition={availableFilterDefinition}
              />
            ),
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </>
  );
};
