import { Context, useCallback, useState } from 'react';

import { LightButton } from '@/ui/button/components/LightButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronDown } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { SortDropdownId } from '../constants/SortDropdownId';
import { sortsScopedState } from '../states/sortsScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '../types/interface';

export type SortDropdownButtonProps<SortField> = {
  availableSorts: SortType<SortField>[];
  hotkeyScope: FiltersHotkeyScope;
  context: Context<string | null>;
  isPrimaryButton?: boolean;
};

const options: Array<SelectedSortType<any>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField>({
  context,
  availableSorts,
  hotkeyScope,
}: SortDropdownButtonProps<SortField>) {
  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);
  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SelectedSortType<SortField>['order']>('asc');

  const [sorts, setSorts] = useRecoilScopedState<SelectedSortType<SortField>[]>(
    sortsScopedState,
    context,
  );

  const isSortSelected = sorts.length > 0;

  const onSortItemSelect = useCallback(
    (sort: SortType<SortField>) => {
      const newSort = { ...sort, order: selectedSortDirection };
      const sortIndex = sorts.findIndex((sort) => sort.key === newSort.key);
      const newSorts = [...sorts];

      if (sortIndex !== -1) {
        newSorts[sortIndex] = newSort;
      } else {
        newSorts.push(newSort);
      }

      setSorts(newSorts);
    },
    [selectedSortDirection, setSorts, sorts],
  );

  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: SortDropdownId,
    onDropdownToggle: resetState,
  });

  function handleAddSort(sort: SortType<SortField>) {
    toggleDropdownButton();
    onSortItemSelect(sort);
  }

  return (
    <DropdownButton
      buttonComponents={
        <LightButton
          title="Sort"
          active={isSortSelected}
          onClick={toggleDropdownButton}
        />
      }
      dropdownComponents={
        <StyledDropdownMenu>
          {isOptionUnfolded ? (
            <StyledDropdownMenuItemsContainer>
              {options.map((option, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    setSelectedSortDirection(option);
                    setIsOptionUnfolded(false);
                  }}
                  text={option === 'asc' ? 'Ascending' : 'Descending'}
                />
              ))}
            </StyledDropdownMenuItemsContainer>
          ) : (
            <>
              <DropdownMenuHeader
                EndIcon={IconChevronDown}
                onClick={() => setIsOptionUnfolded(true)}
              >
                {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </DropdownMenuHeader>
              <StyledDropdownMenuSeparator />
              <StyledDropdownMenuItemsContainer>
                {availableSorts.map((sort, index) => (
                  <MenuItem
                    testId={`select-sort-${index}`}
                    key={index}
                    onClick={() => handleAddSort(sort)}
                    LeftIcon={sort.Icon}
                    text={sort.label}
                  />
                ))}
              </StyledDropdownMenuItemsContainer>
            </>
          )}
        </StyledDropdownMenu>
      }
      dropdownId={SortDropdownId}
    ></DropdownButton>
  );
}
