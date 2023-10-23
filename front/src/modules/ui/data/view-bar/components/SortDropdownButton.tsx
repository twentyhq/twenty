import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
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
    dropdownScopeId: dropdownId,
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
    <DropdownScope dropdownScopeId={SortDropdownId}>
      <StyledDropdownContainer isInViewBar={isInViewBar}>
        <Dropdown
          // dropdownId={dropdownId}
          dropdownHotkeyScope={hotkeyScope}
          dropdownOffset={{ y: 8 }}
          clickableComponent={
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
                  </DropdownMenuItemsContainer>
                </>
              )}
            </>
          }
          onClose={handleDropdownButtonClose}
        />
      </StyledDropdownContainer>
    </DropdownScope>
  );
};
