import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import {
  currentParentFilterDefinitionState,
  currentSubMenuState,
} from '@/object-record/object-filter-dropdown/states/subMenuStates';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { getHeaderTitle } from '@/object-record/object-filter-dropdown/utils/getHeaderTitle';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { getSubMenuOptions } from '@/object-record/object-filter-dropdown/utils/getSubMenuOptions';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconChevronLeft, useIcons } from 'twenty-ui';

export const ObjectFilterSelectSubMenu = () => {
  const [searchText, setSearchText] = useState('');
  const { getIcon } = useIcons();

  const [currentSubMenu, setCurrentSubMenu] =
    useRecoilState(currentSubMenuState);

  const currentParentFilterDefinition = useRecoilValue(
    currentParentFilterDefinitionState,
  );

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();

  const setHotkeyScope = useSetHotkeyScope();

  const handleSelectFilter = (definition: FilterDefinition | null) => {
    if (definition !== null) {
      setFilterDefinitionUsedInDropdown(definition);
      if (definition.type === 'SOURCE') {
        setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
      }

      setSelectedOperandInDropdown(
        getOperandsForFilterType(definition.type)?.[0],
      );

      setObjectFilterDropdownSearchInput('');
    }
  };

  return (
    <>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={() => {
          setCurrentSubMenu(null);
        }}
      >
        {getHeaderTitle(currentSubMenu)}
      </DropdownMenuHeader>
      <StyledInput
        value={searchText}
        autoFocus
        placeholder="Search fields"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      />
      <DropdownMenuItemsContainer>
        {getSubMenuOptions(currentSubMenu)
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((item) =>
            item.name
              .toLocaleLowerCase()
              .includes(searchText.toLocaleLowerCase()),
          )
          .map((menuOption, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              onClick={() => {
                currentParentFilterDefinition &&
                  handleSelectFilter({
                    ...currentParentFilterDefinition,
                    label: menuOption.name,
                    type: menuOption.type as FilterType,
                  });
              }}
              text={menuOption.name}
              LeftIcon={getIcon(
                menuOption.icon || currentParentFilterDefinition?.iconName,
              )}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
