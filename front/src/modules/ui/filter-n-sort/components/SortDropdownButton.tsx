import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import { IconChevronDown } from '@tabler/icons-react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';

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
  const theme = useTheme();

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
          <DropdownMenuHeader
            endIcon={<IconChevronDown size={theme.icon.size.md} />}
            onClick={() => setIsOptionUnfolded(true)}
          >
            {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </DropdownMenuHeader>
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
                {sort.icon}
                <OverflowingTextWithTooltip text={sort.label} />
              </DropdownMenuSelectableItem>
            ))}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownButton>
  );
}
