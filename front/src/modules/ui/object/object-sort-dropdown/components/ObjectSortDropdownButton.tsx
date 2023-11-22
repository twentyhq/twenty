import { useCallback, useState } from 'react';

import { IconChevronDown } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { useObjectSortDropdown } from '../hooks/useObjectSortDropdown';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

export type ObjectSortDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  isPrimaryButton?: boolean;
};

export const ObjectSortDropdownButton = ({
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

  const { availableSortDefinitions, onSortSelect, isSortSelected } =
    useObjectSortDropdown();

  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectSortDropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

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

  const { icons } = useLazyLoadIcons();

  return (
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
                  {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </DropdownMenuHeader>
                <DropdownMenuSeparator />
                <DropdownMenuItemsContainer>
                  {availableSortDefinitions.map(
                    (availableSortDefinition, index) => (
                      <MenuItem
                        testId={`select-sort-${index}`}
                        key={index}
                        onClick={() => handleAddSort(availableSortDefinition)}
                        LeftIcon={icons[availableSortDefinition.iconName]}
                        text={availableSortDefinition.label}
                      />
                    ),
                  )}
                </DropdownMenuItemsContainer>
              </>
            )}
          </>
        }
        onClose={handleDropdownButtonClose}
      />
    </DropdownScope>
  );
};
