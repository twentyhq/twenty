import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { getSubMenuOptions } from '@/object-record/object-filter-dropdown/utils/getSubMenuOptions';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useState } from 'react';
import { IconChevronLeft, useIcons } from 'twenty-ui';

type ObjectFilterSelectSubMenuProps = {
  currentSubMenu: FilterType;
  setCurrentSubMenu: (currentSubMenu: FilterType | null) => void;
  parent: FilterDefinition | null;
};

export const ObjectFilterSelectSubMenu = ({
  currentSubMenu,
  setCurrentSubMenu,
  parent,
}: ObjectFilterSelectSubMenuProps) => {
  const [searchText, setSearchText] = useState('');

  const getHeaderTitle = (subMenu: FilterType | null) => {
    switch (subMenu) {
      case 'ACTOR':
        return 'Actor';
      case 'SOURCE':
        return 'Creation Source';
      default:
        return;
    }
  };

  const { getIcon } = useIcons();

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
                parent &&
                  handleSelectFilter({
                    ...parent,
                    label: menuOption.name,
                    type: menuOption.type as FilterType,
                  });
              }}
              text={menuOption.name}
              LeftIcon={getIcon(menuOption.icon || parent?.iconName)}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
