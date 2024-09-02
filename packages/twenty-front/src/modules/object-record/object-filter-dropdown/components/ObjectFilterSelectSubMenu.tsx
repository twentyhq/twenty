import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { getSubMenuOptions } from '@/object-record/object-filter-dropdown/utils/getSubMenuOptions';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useState } from 'react';
import { IconApps, IconChevronLeft, useIcons } from 'twenty-ui';

type SubMenuProps = {
  currentSubMenu: FilterType;
  setCurrentSubMenu: (currentSubMenu: FilterType | null) => void;
  parent: FilterDefinition | null;
};

export const SubMenu = ({
  currentSubMenu,
  setCurrentSubMenu,
  parent,
}: SubMenuProps) => {
  const [searchText, setSearchText] = useState('');

  const getHeaderTitle = (subMenu: FilterType | null) => {
    switch (subMenu) {
      case 'ADDRESS':
        return 'Address';
      case 'FULL_NAME':
        return 'Full Name';
      case 'LINKS':
        return 'Links';
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

  const handleSelectFilter = (definition: FilterDefinition | null) => {
    if (definition !== null) {
      setFilterDefinitionUsedInDropdown(definition);

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
        <MenuItem
          key={`select-filter-${-1}`}
          testId={`select-filter-${-1}`}
          onClick={() => {
            handleSelectFilter(parent);
          }}
          LeftIcon={IconApps}
          text={`Any ${getHeaderTitle(currentSubMenu)} field`}
        />
        {getSubMenuOptions(currentSubMenu)
          .sort((a, b) => a.localeCompare(b))
          .filter((item) =>
            item.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
          )
          .map((menuOption, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              onClick={() =>
                parent &&
                handleSelectFilter({
                  ...parent,
                  label: menuOption,
                })
              }
              text={menuOption}
              LeftIcon={getIcon(parent?.iconName)}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
