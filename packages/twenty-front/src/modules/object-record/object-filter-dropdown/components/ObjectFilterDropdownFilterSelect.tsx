import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

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
  const {isSelectedItemIdSelector} = useSelectableList(OBJECT_FILTER_DROPDOWN_ID)
  const isSelectedItemId = (id:string)=> useRecoilValue(isSelectedItemIdSelector(id));
  const refactoredAvailableFilterDefinitions = [...availableFilterDefinitions]
  .sort((a, b) => a.label.localeCompare(b.label))
  .filter((item) =>
    item.label
      .toLocaleLowerCase()
      .includes(searchText.toLocaleLowerCase()),
  )
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
      <SelectableList hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}  selectableItemIdArray={refactoredAvailableFilterDefinitions.map((item)=>item.fieldMetadataId)} selectableListId={OBJECT_FILTER_DROPDOWN_ID}>
      <DropdownMenuItemsContainer>
        {refactoredAvailableFilterDefinitions
          .map((availableFilterDefinition, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              hovered={isSelectedItemId(availableFilterDefinition.fieldMetadataId)}
              onClick={() => {
                setFilterDefinitionUsedInDropdown(availableFilterDefinition);

                if (
                  availableFilterDefinition.type === 'RELATION' ||
                  availableFilterDefinition.type === 'SELECT'
                ) {
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
      </SelectableList>
      
    </>
  );
};
