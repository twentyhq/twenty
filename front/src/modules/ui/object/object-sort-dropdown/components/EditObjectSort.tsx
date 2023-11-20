import { useCallback, useState } from 'react';

import { IconArrowDown, IconArrowUp, IconChevronDown } from '@/ui/display/icon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import SortOrFilterChip from '@/views/components/SortOrFilterChip';
import { useView } from '@/views/hooks/useView';

import { useObjectSortDropdown } from '../hooks/useObjectSortDropdown';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

export type EditObjectSortProps = {
  fieldMetadataId: string;
  label: string;
  direction: 'asc' | 'desc';
};

export const EditObjectSort = ({
  fieldMetadataId,
  label,
  direction,
}: EditObjectSortProps) => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SortDirection>('asc');

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const { availableSortDefinitions, onSortSelect } = useObjectSortDropdown();

  const dropdownScopeId = `sort-${fieldMetadataId}`;

  const { toggleDropdown } = useDropdown({
    dropdownScopeId,
  });

  const { removeViewSort } = useView();

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

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <Dropdown
        dropdownHotkeyScope={{ scope: dropdownScopeId }}
        dropdownOffset={{ y: 8 }}
        clickableComponent={
          <>
            <SortOrFilterChip
              key={fieldMetadataId}
              testId={fieldMetadataId}
              labelValue={label}
              Icon={direction === 'desc' ? IconArrowDown : IconArrowUp}
              isSort
              onRemove={() => removeViewSort(fieldMetadataId)}
            />
          </>
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
                  {availableSortDefinitions.map((availableSort, index) => (
                    <MenuItem
                      testId={`select-sort-${index}`}
                      key={index}
                      onClick={() => handleAddSort(availableSort)}
                      LeftIcon={availableSort.Icon}
                      text={availableSort.label}
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
  );
};
