import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { SelectedSortType, SortType } from './interface';
import ReactIcon from '../../icons/ReactIcon';

type OwnProps<SortField> = {
  sorts: SelectedSortType<SortField>[];
  setSorts: (sorts: SelectedSortType<SortField>[]) => void;
  availableSorts: SortType<SortField>[];
};

const options: Array<SelectedSortType<string>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortField extends string>({
  availableSorts,
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

  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  return (
    <DropdownButton
      label="Sort"
      isActive={sorts.length > 0}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
      resetState={resetState}
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
            ...availableSorts.map((sort, index) => (
              <DropdownButton.StyledDropdownItem
                key={index + 1}
                onClick={() => {
                  setIsUnfolded(false);
                  onSortItemSelect(sort);
                }}
              >
                <DropdownButton.StyledIcon>
                  {sort.icon && <ReactIcon icon={sort.icon} />}
                </DropdownButton.StyledIcon>
                {sort.label}
              </DropdownButton.StyledDropdownItem>
            )),
          ]}
    </DropdownButton>
  );
}
