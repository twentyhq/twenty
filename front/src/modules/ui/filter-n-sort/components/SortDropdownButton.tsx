import { useCallback, useState } from 'react';

import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '../types/interface';

import DropdownButton from './DropdownButton';

type OwnProps<SortField> = {
  isSortSelected: boolean;
  onSortSelect: (sort: SelectedSortType<SortField>) => void;
  availableSorts: SortType<SortField>[];
  HotkeyScope: FiltersHotkeyScope;
};

const options: Array<SelectedSortType<any>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField>({
  isSortSelected,
  availableSorts,
  onSortSelect,
  HotkeyScope,
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

  function handleIsUnfoldedChange(newIsUnfolded: boolean) {
    if (newIsUnfolded) {
      setIsUnfolded(true);
    } else {
      setIsUnfolded(false);
      resetState();
    }
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
        <DropdownMenuItemsContainer>
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
        </DropdownMenuItemsContainer>
      ) : (
        <>
          <DropdownButton.StyledDropdownTopOption
            onClick={() => setIsOptionUnfolded(true)}
          >
            {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}

            <DropdownButton.StyledDropdownTopOptionAngleDown />
          </DropdownButton.StyledDropdownTopOption>
          <DropdownMenuSeparator />

          <DropdownMenuItemsContainer>
            {availableSorts.map((sort, index) => (
              <DropdownMenuSelectableItem
                key={index}
                onClick={() => {
                  setIsUnfolded(false);
                  onSortItemSelect(sort);
                }}
              >
                <DropdownButton.StyledIcon>
                  {sort.icon}
                </DropdownButton.StyledIcon>
                {sort.label}
              </DropdownMenuSelectableItem>
            ))}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownButton>
  );
}
