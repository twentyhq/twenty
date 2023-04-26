import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { SelectedSortType, SortType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type OwnProps<SortField> = {
  sorts: SelectedSortType<SortField>[];
  setSorts: (sorts: SelectedSortType<SortField>[]) => void;
  sortsAvailable: SortType<SortField>[];
};

const options: Array<SelectedSortType<string>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField extends string>({
  sortsAvailable,
  setSorts,
  sorts,
}: OwnProps<SortField>) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SelectedSortType<SortField>['order']>('asc');

  const onSortItemSelect = useCallback(
    (sort: SortType<SortField>) => {
      const newSorts = [{ ...sort, order: selectedSortDirection }];
      setSorts(newSorts);
    },
    [setSorts, selectedSortDirection],
  );

  return (
    <DropdownButton
      label="Sort"
      isActive={sorts.length > 0}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
    >
      {isOptionUnfolded
        ? options.map((option, index) => (
            <DropdownButton.StyledDropdownItem
              key={index}
              onClick={() => {
                setSelectedSortDirection(option);
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
            ...sortsAvailable.map((sort, index) => (
              <DropdownButton.StyledDropdownItem
                key={index + 1}
                onClick={() => {
                  setIsUnfolded(false);
                  onSortItemSelect(sort);
                }}
              >
                <DropdownButton.StyledIcon>
                  {sort.icon && <FontAwesomeIcon icon={sort.icon} />}
                </DropdownButton.StyledIcon>
                {sort.label}
              </DropdownButton.StyledDropdownItem>
            )),
          ]}
    </DropdownButton>
  );
}
