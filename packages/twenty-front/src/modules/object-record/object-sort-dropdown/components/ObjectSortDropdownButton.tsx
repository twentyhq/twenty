import { IconChevronDown, useIcons } from 'twenty-ui';

import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useObjectSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useObjectSortDropdown';
import { ObjectSortDropdownScope } from '@/object-record/object-sort-dropdown/scopes/ObjectSortDropdownScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { SORT_DIRECTIONS } from '../types/SortDirection';

export type ObjectSortDropdownButtonProps = {
  sortDropdownId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
  sortDropdownId,
  hotkeyScope,
}: ObjectSortDropdownButtonProps) => {
  const {
    isSortDirectionMenuUnfolded,
    setIsSortDirectionMenuUnfolded,
    selectedSortDirection,
    setSelectedSortDirection,
    toggleSortDropdown,
    resetState,
    availableSortDefinitions,
    handleAddSort,
  } = useObjectSortDropdown();

  const { isDropdownOpen } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  const handleButtonClick = () => {
    toggleSortDropdown();
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  const { getIcon } = useIcons();

  return (
    <ObjectSortDropdownScope sortScopeId={sortDropdownId}>
      <Dropdown
        dropdownId={OBJECT_SORT_DROPDOWN_ID}
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ y: 8 }}
        clickableComponent={
          <StyledHeaderDropdownButton
            isUnfolded={isDropdownOpen}
            onClick={handleButtonClick}
          >
            Sort
          </StyledHeaderDropdownButton>
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
                <DropdownMenuSeparator />
                <DropdownMenuItemsContainer>
                  {[...availableSortDefinitions]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((availableSortDefinition, index) => (
                      <MenuItem
                        testId={`select-sort-${index}`}
                        key={index}
                        onClick={() => handleAddSort(availableSortDefinition)}
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
