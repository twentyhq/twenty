import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { produce } from 'immer';

import { LightButton } from '@/ui/button/components/LightButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
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
  customDropdownId?: string;
  isInViewBar?: boolean;
  isPrimaryButton?: boolean;
};

const StyledDropdownContainer = styled.div<{ isInViewBar?: boolean }>`
  ${({ isInViewBar }) =>
    isInViewBar &&
    `
  left: 0px;
  position: absolute;
  top: 32px;
  z-index: 1;
`}
`;

export const SortDropdownButton = ({
  hotkeyScope,
  customDropdownId,
  isInViewBar,
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

  const dropdownId = isInViewBar
    ? (customDropdownId as string)
    : SortDropdownId;

  const { toggleDropdown } = useDropdown({
    dropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

  const handleSorts = (
    selectedSortDefinition: SortDefinition,
    keyId?: string,
  ) => {
    toggleDropdown();

    setSorts(
      produce(sorts, (existingSortsDraft) => {
        const findSortIndexByKey = (key?: string) =>
          !key
            ? -1
            : existingSortsDraft.findIndex(
                (existingSort) => existingSort.key === key,
              );

        const defaultSortIndex = findSortIndexByKey(selectedSortDefinition.key);
        const alternateSortIndex = findSortIndexByKey(keyId);

        const foundExistingSortIndex =
          defaultSortIndex !== -1 ? defaultSortIndex : alternateSortIndex;

        const newSort = {
          key: selectedSortDefinition.key,
          direction: selectedSortDirection,
          definition: selectedSortDefinition,
        };

        if (foundExistingSortIndex !== -1) {
          existingSortsDraft[foundExistingSortIndex] = newSort;
        } else {
          existingSortsDraft.push(newSort);
        }
      }),
    );
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  return (
    <StyledDropdownContainer isInViewBar={isInViewBar}>
      <ViewBarDropdownButton
        dropdownId={dropdownId}
        dropdownHotkeyScope={hotkeyScope}
        buttonComponent={
          isInViewBar ? (
            <></>
          ) : (
            <LightButton
              title="Sort"
              active={isSortSelected}
              onClick={handleButtonClick}
            />
          )
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
                      onClick={() =>
                        handleSorts(
                          availableSort,
                          isInViewBar
                            ? customDropdownId?.split('-')[0]
                            : undefined,
                        )
                      }
                      LeftIcon={availableSort.Icon}
                      text={availableSort.label}
                    />
                  ))}
                </StyledDropdownMenuItemsContainer>
              </>
            )}
          </StyledDropdownMenu>
        }
        onClose={handleDropdownButtonClose}
      ></ViewBarDropdownButton>
    </StyledDropdownContainer>
  );
};
