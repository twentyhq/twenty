import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { SortType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type OwnProps = {
  sorts: SortType[];
  setSorts: (sorts: SortType[]) => void;
  sortsAvailable: SortType[];
};

export function SortDropdownButton({
  sortsAvailable,
  setSorts,
  sorts,
}: OwnProps) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const onSortItemSelect = useCallback(
    (sort: SortType) => {
      const newSorts = [sort];
      setSorts(newSorts);
    },
    [setSorts],
  );

  return (
    <DropdownButton
      label="Sort"
      isActive={sorts.length > 0}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
    >
      {sortsAvailable.map((option, index) => (
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
      ))}
    </DropdownButton>
  );
}
