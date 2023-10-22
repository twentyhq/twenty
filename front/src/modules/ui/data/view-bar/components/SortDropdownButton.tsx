import { useCallback, useState } from 'react';
import { produce } from 'immer';

import { IconChevronDown } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { SortDropdownId } from '../constants/SortDropdownId';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { sortsScopedState } from '../states/sortsScopedState';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

export type SortDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  isPrimaryButton?: boolean;
};

export const SortDropdownButton = ({
  hotkeyScope,
}: SortDropdownButtonProps) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SortDirection>('asc');

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const [availableSorts] = useRecoilScopedState(
    availableSortsScopedState,
    ViewBarRecoilScopeContext,
  );

  const [sorts, setSorts] = useRecoilScopedState(
    sortsScopedState,
    ViewBarRecoilScopeContext,
  );

  const isSortSelected = sorts.length > 0;

  const { toggleDropdown } = useDropdown({
    dropdownScopeId: SortDropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

  const handleAddSort = (selectedSortDefinition: SortDefinition) => {
    toggleDropdown();

    setSorts(
      produce(sorts, (existingSortsDraft) => {
        const foundExistingSortIndex = existingSortsDraft.findIndex(
          (existingSort) => existingSort.key === selectedSortDefinition.key,
        );

        if (foundExistingSortIndex !== -1) {
          existingSortsDraft[foundExistingSortIndex].direction =
            selectedSortDirection;
        } else {
          existingSortsDraft.push({
            key: selectedSortDefinition.key,
            direction: selectedSortDirection,
            definition: selectedSortDefinition,
          });
        }
      }),
    );
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  return (
    <DropdownScope dropdownScopeId={SortDropdownId}>
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
                  {availableSorts.map((availableSort, index) => (
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
