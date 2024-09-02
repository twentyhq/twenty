import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconApps, IconChevronLeft, useIcons } from 'twenty-ui';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

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

type SubMenuProps = {
  currentSubMenu: FilterType;
  setCurrentSubMenu: (currentSubMenu: FilterType | null) => void;
  parent: FilterDefinition | null;
};

export const getSubMenuOptions = (subMenu: FilterType | null) => {
  switch (subMenu) {
    case 'ADDRESS':
      return [
        'Address 1',
        'Address 2',
        'City',
        'Post Code',
        'State',
        'Country',
      ];
    case 'FULL_NAME':
      return ['First Name', 'Last Name'];
    case 'LINKS':
      return ['Link URL', 'Link Label'];
    default:
      return [];
  }
};

const SubMenu = ({
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

export const isCompositeField = (type: FilterType) =>
  ['ADDRESS', 'FULL_NAME', 'LINKS'].includes(type);

export const ObjectFilterDropdownFilterSelect = () => {
  const [searchText, setSearchText] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState<FilterType | null>(null);
  const [currentParentFilterDefinition, setCurrentParentFilterDefinition] =
    useState<FilterDefinition | null>(null);
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

  const handleSelectFilter = (availableFilterDefinition: FilterDefinition) => {
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
  };

  return (
    <>
      {!currentSubMenu ? (
        <>
          <StyledInput
            value={searchText}
            autoFocus
            placeholder="Search fields"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearchText(event.target.value)
            }
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
                    if (isCompositeField(availableFilterDefinition.type)) {
                      setCurrentSubMenu(availableFilterDefinition.type);
                      setCurrentParentFilterDefinition(
                        availableFilterDefinition,
                      );
                    } else {
                      handleSelectFilter(availableFilterDefinition);
                    }
                  }}
                  LeftIcon={getIcon(availableFilterDefinition.iconName)}
                  text={availableFilterDefinition.label}
                  hasSubMenu={isCompositeField(availableFilterDefinition.type)}
                />
              ))}
          </DropdownMenuItemsContainer>
        </>
      ) : (
        <SubMenu
          currentSubMenu={currentSubMenu}
          parent={currentParentFilterDefinition}
          setCurrentSubMenu={setCurrentSubMenu}
        />
      )}
    </>
  );
};
