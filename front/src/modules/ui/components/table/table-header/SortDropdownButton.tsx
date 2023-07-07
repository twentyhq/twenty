import { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';

import {
  SelectedSortType,
  SortType,
} from '@/filters-and-sorts/interfaces/sorts/interface';
import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';

import DropdownButton from './DropdownButton';

type OwnProps<SortField> = {
  isSortSelected: boolean;
  onSortSelect: (sort: SelectedSortType<SortField>) => void;
  availableSorts: SortType<SortField>[];
};

const options: Array<SelectedSortType<any>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField>({
  isSortSelected,
  availableSorts,
  onSortSelect,
}: OwnProps<SortField>) {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );

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
    setCaptureHotkeyTypeInFocus(false);
    setSelectedSortDirection('asc');
  }, [setCaptureHotkeyTypeInFocus]);

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
    >
      {isOptionUnfolded
        ? options.map((option, index) => (
            <DropdownButton.StyledDropdownItem
              key={index}
              onClick={() => {
                setSelectedSortDirection(option);
                setCaptureHotkeyTypeInFocus(false);
                setIsOptionUnfolded(false);
              }}
            >
              {option === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownButton.StyledDropdownItem>
          ))
        : [
            <DropdownButton.StyledDropdownTopOption
              key={0}
              onClick={() => setIsOptionUnfolded(true)}
            >
              {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}

              <DropdownButton.StyledDropdownTopOptionAngleDown />
            </DropdownButton.StyledDropdownTopOption>,
            ...availableSorts.map((sort, index) => (
              <DropdownButton.StyledDropdownItem
                key={index + 1}
                onClick={() => {
                  setIsUnfolded(false);
                  setCaptureHotkeyTypeInFocus(false);
                  onSortItemSelect(sort);
                }}
              >
                <DropdownButton.StyledIcon>
                  {sort.icon}
                </DropdownButton.StyledIcon>
                {sort.label}
              </DropdownButton.StyledDropdownItem>
            )),
          ]}
    </DropdownButton>
  );
}
