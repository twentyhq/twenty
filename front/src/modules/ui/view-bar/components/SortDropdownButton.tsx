import { useCallback, useState } from 'react';
import { produce } from 'immer';

import { LightButton } from '@/ui/button/components/LightButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconChevronDown } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { SortDropdownId } from '../constants/SortDropdownId';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { sortsScopedState } from '../states/sortsScopedState';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

import { ViewBarDropdownButton } from './ViewBarDropdownButton';

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
    <ViewBarDropdownButton
      dropdownId={SortDropdownId}
      dropdownHotkeyScope={hotkeyScope}
      buttonComponent={
        <LightButton
          title="Sort"
          active={isSortSelected}
          onClick={handleButtonClick}
        />
      }
      dropdownComponents={
        <StyledDropdownMenu>
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
              <StyledDropdownMenuSeparator />
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
        </StyledDropdownMenu>
      }
      onClose={handleDropdownButtonClose}
    ></ViewBarDropdownButton>
  );
};
