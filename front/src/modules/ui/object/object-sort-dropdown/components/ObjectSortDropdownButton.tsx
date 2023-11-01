import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

// import { produce } from 'immer';
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

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { useObjectSortDropdown } from '../hooks/useObjectSortDropdown';
import { SortDefinition } from '../types/SortDefinition';
// import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';
import { SortDirection } from '../types/SortDirection';

export type ObjectSortDropdownButtonProps = {
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

export const ObjectSortDropdownButton = ({
  hotkeyScope,
  customDropdownId,
  isInViewBar,
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

  const dropdownId = isInViewBar
    ? (customDropdownId as string)
    : ObjectSortDropdownId;

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
    // FIXME: This no longer works with the new changes
    // setSorts(
    //   produce(sorts, (existingSortsDraft) => {
    //     const findSortIndexByKey = (key?: string) =>
    //       !key
    //         ? -1
    //         : existingSortsDraft.findIndex(
    //             (existingSort) => existingSort.key === key,
    //           );

    //     const defaultSortIndex = findSortIndexByKey(selectedSortDefinition.key);
    //     const alternateSortIndex = findSortIndexByKey(keyId);

    //     const foundExistingSortIndex =
    //       defaultSortIndex !== -1 ? defaultSortIndex : alternateSortIndex;

    //     const newSort = {
    //       key: selectedSortDefinition.key,
    //       direction: selectedSortDirection,
    //       definition: selectedSortDefinition,
    //     };

    //     if (foundExistingSortIndex !== -1) {
    //       existingSortsDraft[foundExistingSortIndex] = newSort;
    //     } else {
    //       existingSortsDraft.push(newSort);
    //     }
    //   }),
    // );

    onSortSelect?.({
      fieldId: selectedSortDefinition.fieldId,
      direction: selectedSortDirection,
      definition: selectedSortDefinition,
    });
  };

  const handleDropdownButtonClose = () => {
    resetState();
  };

  return (
    <DropdownScope dropdownScopeId={ObjectSortDropdownId}>
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
                  {availableSortDefinitions.map((availableSort, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        // FIXME: How do we get the sort order?
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
                    {availableSortDefinitions.map((availableSort, index) => (
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
