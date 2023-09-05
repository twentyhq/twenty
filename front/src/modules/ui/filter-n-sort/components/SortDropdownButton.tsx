import { Context, useCallback, useState } from 'react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconChevronDown } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { sortAndFilterBarScopedState } from '../states/sortAndFilterBarScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '../types/interface';

import DropdownButton from './DropdownButton';

type OwnProps<SortField> = {
  isSortSelected: boolean;
  onSortSelect: (sort: SelectedSortType<SortField>) => void;
  availableSorts: SortType<SortField>[];
  HotkeyScope: FiltersHotkeyScope;
  context: Context<string | null>;
  isPrimaryButton?: boolean;
};

const options: Array<SelectedSortType<any>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField>({
  isSortSelected,
  availableSorts,
  onSortSelect,
  HotkeyScope,
  context,
}: OwnProps<SortField>) {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);
  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SelectedSortType<SortField>['order']>('asc');

  const onSortItemSelect = useCallback(
    (sort: SortType<SortField>) => {
      onSortSelect({ ...sort, order: selectedSortDirection });
    },
    [onSortSelect, selectedSortDirection],
  );

  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const [, setIsSortAndFilterBarOpen] = useRecoilScopedState(
    sortAndFilterBarScopedState,
    context,
  );

  function handleIsUnfoldedChange(newIsUnfolded: boolean) {
    if (newIsUnfolded) {
      setIsUnfolded(true);
    } else {
      setIsUnfolded(false);
      resetState();
    }
  }

  function handleAddSort(sort: SortType<SortField>) {
    setIsUnfolded(false);
    onSortItemSelect(sort);
    setIsSortAndFilterBarOpen(true);
  }

  return (
    <DropdownButton
      label="Sort"
      isActive={isSortSelected}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={handleIsUnfoldedChange}
      HotkeyScope={HotkeyScope}
    >
      {isOptionUnfolded ? (
        <StyledDropdownMenuItemsContainer>
          {options.map((option, index) => (
            <DropdownMenuSelectableItem
              key={index}
              onClick={() => {
                setSelectedSortDirection(option);
                setIsOptionUnfolded(false);
              }}
            >
              {option === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuSelectableItem>
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
              <DropdownMenuSelectableItem
                key={index}
                onClick={() => handleAddSort(sort)}
              >
                {sort.icon}
                <OverflowingTextWithTooltip text={sort.label} />
              </DropdownMenuSelectableItem>
            ))}
          </StyledDropdownMenuItemsContainer>
        </>
      )}
    </DropdownButton>
  );
}
