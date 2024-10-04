import styled from '@emotion/styled';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

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

type ObjectFilterSelectMenuProps = {
  searchText: string;
  setSearchText: (searchText: string) => void;
  sortedAvailableFilterDefinitions: FilterDefinition[];
  selectableListItemIds: string[];
  handleEnter: (itemId: string) => void;
};

export const ObjectFilterSelectMenu = ({
  searchText,
  setSearchText,
  sortedAvailableFilterDefinitions,
  selectableListItemIds,
  handleEnter,
}: ObjectFilterSelectMenuProps) => {
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
            (availableFilterDefinition: FilterDefinition, index: number) => (
              <SelectableItem
                key={`selectable-item-${availableFilterDefinition.fieldMetadataId}`}
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
