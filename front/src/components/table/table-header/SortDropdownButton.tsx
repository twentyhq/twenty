import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { SelectedSortType, SortType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/pro-regular-svg-icons';

type OwnProps<SortFields> = {
  sorts: SelectedSortType<SortFields>[];
  setSorts: (sorts: SelectedSortType<SortFields>[]) => void;
  sortsAvailable: SortType<SortFields>[];
};

const options: Array<SelectedSortType<string>['order']> = ['asc', 'desc'];

export function SortDropdownButton<SortFields extends string>({
  sortsAvailable,
  setSorts,
  sorts,
}: OwnProps<SortFields>) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedOption, setSelectedOption] =
    useState<SelectedSortType<SortFields>['order']>('asc');

  const onSortItemSelect = useCallback(
    (sort: SortType<SortFields>) => {
      const newSorts = [{ ...sort, order: selectedOption }];
      setSorts(newSorts);
    },
    [setSorts, selectedOption],
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
                setSelectedOption(option);
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
              {selectedOption === 'asc' ? 'Ascending' : 'Descending'}

              <FontAwesomeIcon icon={faAngleDown} />
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
