import { Dispatch, SetStateAction } from 'react';

import { IconChevronDown } from '@/ui/display/icon';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSortDropdown } from '@/ui/object/object-sort-dropdown/hooks/useSortDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS } from '../types/SortDirection';

export type ObjectSortDropdownProps = {
  sortDropdownId?: string;
  clickableComponent: JSX.Element;
  dropdownScopeId: string;
  dropdownHotkeyScope: HotkeyScope;
  selectedSortDirection: 'desc' | 'asc';
  isSortDirectionMenuUnfolded: boolean;
  setIsSortDirectionMenuUnfolded: Dispatch<SetStateAction<boolean>>;
  setSelectedSortDirection: Dispatch<SetStateAction<'desc' | 'asc'>>;
  resetState: () => void;
};

export const ObjectSortDropdown = ({
  sortDropdownId,
  clickableComponent,
  dropdownScopeId,
  dropdownHotkeyScope,
  selectedSortDirection,
  isSortDirectionMenuUnfolded,
  setIsSortDirectionMenuUnfolded,
  setSelectedSortDirection,
  resetState,
}: ObjectSortDropdownProps) => {
  const { availableSortDefinitions, onSortSelect } = useSortDropdown({
    sortDropdownId,
  });

  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectSortDropdownId,
  });

  const handleAddSort = (selectedSortDefinition: SortDefinition) => {
    toggleDropdown();
    onSortSelect?.({
      fieldMetadataId: selectedSortDefinition.fieldMetadataId,
      direction: selectedSortDirection,
      definition: selectedSortDefinition,
    });
  };

  const { icons } = useLazyLoadIcons();

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <Dropdown
        dropdownHotkeyScope={dropdownHotkeyScope}
        dropdownOffset={{ y: 8 }}
        clickableComponent={clickableComponent}
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
                        LeftIcon={icons[availableSortDefinition.iconName]}
                        text={availableSortDefinition.label}
                      />
                    ))}
                </DropdownMenuItemsContainer>
              </>
            )}
          </>
        }
        onClose={resetState}
      />
    </DropdownScope>
  );
};
