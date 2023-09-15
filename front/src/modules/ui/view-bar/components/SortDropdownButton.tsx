import { Context, useCallback, useState } from 'react';
import { produce } from 'immer';

import { LightButton } from '@/ui/button/components/LightButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronDown } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { SortDropdownId } from '../constants/SortDropdownId';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { sortsScopedState } from '../states/sortsScopedState';
import { SortDefinition } from '../types/SortDefinition';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

export type SortDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: HotkeyScope;
  isPrimaryButton?: boolean;
};

export const SortDropdownButton = ({
  hotkeyScope,
  context,
}: SortDropdownButtonProps) => {
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
    context,
  );

  const [sorts, setSorts] = useRecoilScopedState(sortsScopedState, context);

  const isSortSelected = sorts.length > 0;

  const { toggleDropdownButton } = useDropdownButton({
    dropdownId: SortDropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdownButton();
    resetState();
  };

  const handleAddSort = (selectedSortDefinition: SortDefinition) => {
    toggleDropdownButton();

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

  return (
    <DropdownButton
      dropdownId={SortDropdownId}
      dropdownHotkeyScope={hotkeyScope}
      buttonComponents={
        <LightButton
          title="Sort"
          active={isSortSelected}
          onClick={handleButtonClick}
        />
      }
      dropdownComponents={
        <StyledDropdownMenu>
          {isSortDirectionMenuUnfolded ? (
            <StyledDropdownMenuItemsContainer>
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
            </StyledDropdownMenuItemsContainer>
          ) : (
            <>
              <DropdownMenuHeader
                EndIcon={IconChevronDown}
                onClick={() => setIsSortDirectionMenuUnfolded(true)}
              >
                {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </DropdownMenuHeader>
              <StyledDropdownMenuSeparator />
              <StyledDropdownMenuItemsContainer>
                {availableSorts.map((availableSort, index) => (
                  <MenuItem
                    testId={`select-sort-${index}`}
                    key={index}
                    onClick={() => handleAddSort(availableSort)}
                    LeftIcon={availableSort.Icon}
                    text={availableSort.label}
                  />
                ))}
              </StyledDropdownMenuItemsContainer>
            </>
          )}
        </StyledDropdownMenu>
      }
    ></DropdownButton>
  );
};
