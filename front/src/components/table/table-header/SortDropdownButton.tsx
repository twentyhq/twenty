import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { SortType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-regular-svg-icons';

type OwnProps = {
  sorts: SortType[];
  setSorts: (sorts: SortType[]) => void;
  sortsAvailable: Omit<SortType, 'order'>[];
};

const options: Array<SortType['order']> = ['asc', 'desc'];

export function SortDropdownButton({
  sortsAvailable,
  setSorts,
  sorts,
}: OwnProps) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedOption, setSelectedOption] =
    useState<SortType['order']>('asc');

  const onSortItemSelect = useCallback(
    (sort: Omit<SortType, 'order'>) => {
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
              <DropdownButton.StyledIcon>
                <FontAwesomeIcon
                  icon={option === 'asc' ? faArrowDown : faArrowUp}
                />
              </DropdownButton.StyledIcon>
              {option}
            </DropdownButton.StyledDropdownItem>
          ))
        : [
            <DropdownButton.StyledDropdownItem
              onClick={() => setIsOptionUnfolded(true)}
            >
              <DropdownButton.StyledIcon>
                <FontAwesomeIcon
                  icon={selectedOption === 'asc' ? faArrowDown : faArrowUp}
                />
              </DropdownButton.StyledIcon>
              {selectedOption}
            </DropdownButton.StyledDropdownItem>,
            ...sortsAvailable.map((option, index) => (
              <DropdownButton.StyledDropdownItem
                key={index}
                onClick={() => {
                  setIsUnfolded(false);
                  onSortItemSelect(option);
                }}
              >
                <DropdownButton.StyledIcon>
                  {option.icon && <FontAwesomeIcon icon={option.icon} />}
                </DropdownButton.StyledIcon>
                {option.label}
              </DropdownButton.StyledDropdownItem>
            )),
          ]}
    </DropdownButton>
  );
}
