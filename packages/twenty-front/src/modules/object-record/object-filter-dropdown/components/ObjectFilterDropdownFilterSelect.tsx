import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isDefined } from 'twenty-ui';

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

  const selectableListItemIds = sortedAvailableFilterDefinitions.map(
    (item) => item.fieldMetadataId,
  );

  const { selectFilter } = useSelectFilter();

  const { resetSelectedItem } = useSelectableList(OBJECT_FILTER_DROPDOWN_ID);

  const handleEnter = (itemId: string) => {
    const selectedFilterDefinition = sortedAvailableFilterDefinitions.find(
      (item) => item.fieldMetadataId === itemId,
    );

    if (!isDefined(selectedFilterDefinition)) {
      return;
    }

    resetSelectedItem();

    selectFilter({ filterDefinition: selectedFilterDefinition });
  };

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
        selectableItemIdArray={selectableListItemIds}
        selectableListId={OBJECT_FILTER_DROPDOWN_ID}
        onEnter={handleEnter}
      >
        <DropdownMenuItemsContainer>
          {sortedAvailableFilterDefinitions.map(
            (availableFilterDefinition, index) => (
              <SelectableItem
                itemId={availableFilterDefinition.fieldMetadataId}
              >
                <ObjectFilterDropdownFilterSelectMenuItem
                  key={`select-filter-${index}`}
                  filterDefinition={availableFilterDefinition}
                />
              </SelectableItem>
            ),
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </>
  );
};
