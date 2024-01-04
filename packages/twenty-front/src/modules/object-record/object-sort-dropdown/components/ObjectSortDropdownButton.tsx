import { useCallback, useState } from 'react';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { ObjectSortDropdownScope } from '@/object-record/object-sort-dropdown/scopes/ObjectSortDropdownScope';
import { IconChevronDown } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

export type ObjectSortDropdownButtonProps = {
  sortDropdownId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
  sortDropdownId,
  hotkeyScope,
}: ObjectSortDropdownButtonProps) => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SortDirection>('asc');

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const { isSortSelected } = useSortDropdown({
    sortDropdownId: sortDropdownId,
  });

  const { toggleDropdown } = useDropdown(ObjectSortDropdownId);

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

  const { availableSortDefinitions, onSortSelect } = useSortDropdown({
    sortDropdownId: sortDropdownId,
  });

  const handleAddSort = (selectedSortDefinition: SortDefinition) => {
    toggleDropdown();
    onSortSelect?.({
      fieldMetadataId: selectedSortDefinition.fieldMetadataId,
      direction: selectedSortDirection,
      definition: selectedSortDefinition,
    });
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  const { getIcon } = useIcons();

  return (
    <ObjectSortDropdownScope sortScopeId={sortDropdownId}>
      <DropdownScope dropdownScopeId={ObjectSortDropdownId}>
        <Dropdown
          dropdownHotkeyScope={hotkeyScope}
          dropdownOffset={{ y: 8 }}
          clickableComponent={
            <LightButton
              title="Sort"
              active={isSortSelected}
              onClick={handleButtonClick}
            />
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
                    {selectedSortDirection === 'asc'
                      ? 'Ascending'
                      : 'Descending'}
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
      </DropdownScope>
    </ObjectSortDropdownScope>
  );
};
