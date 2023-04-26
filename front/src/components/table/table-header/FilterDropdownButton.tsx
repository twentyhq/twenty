import { useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { FilterType, SelectedFilterType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type OwnProps = {
  filters: SelectedFilterType[];
  setFilters: (sorts: SelectedFilterType[]) => void;
  availableFilters: FilterType[];
};

type FilterOperandType = { label: string; id: string };

const filterOperands: FilterOperandType[] = [
  { label: 'Include', id: 'include' },
  { label: "Doesn't include", id: 'not-include' },
];

const someFieldRandomValue = [
  'John Doe',
  'Jane Doe',
  'John Smith',
  'Jane Smith',
  'John Johnson',
  'Jane Johnson',
  'John Williams',
  'Jane Williams',
  'John Brown',
  'Jane Brown',
  'John Jones',
  'Jane Jones',
];

export function FilterDropdownButton({
  availableFilters,
  setFilters,
  filters,
}: OwnProps) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<FilterType | undefined>(
    undefined,
  );

  const [selectedFilterOperand, setSelectedFilterOperand] =
    useState<FilterOperandType>(filterOperands[0]);

  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedFilter(undefined);
    setSelectedFilterOperand(filterOperands[0]);
  }, []);

  return (
    <DropdownButton
      label="Filter"
      isActive={filters.length > 0}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
      resetState={resetState}
    >
      {selectedFilter
        ? isOptionUnfolded
          ? filterOperands.map((filterOperand, index) => (
              <DropdownButton.StyledDropdownItem
                key={`select-filter-operand-${index}`}
                onClick={() => {
                  setSelectedFilterOperand(filterOperand);
                  setIsOptionUnfolded(false);
                }}
              >
                {filterOperand.label}
              </DropdownButton.StyledDropdownItem>
            ))
          : [
              <DropdownButton.StyledDropdownTopOption
                key={'selected-filter'}
                onClick={() => setSelectedFilter(undefined)}
              >
                <DropdownButton.StyledIcon>
                  {selectedFilter.icon && (
                    <FontAwesomeIcon icon={selectedFilter.icon} />
                  )}
                </DropdownButton.StyledIcon>
                {selectedFilter.label}
                <DropdownButton.StyledDropdownTopOptionAngleDown />
              </DropdownButton.StyledDropdownTopOption>,
              <DropdownButton.StyledDropdownTopOption
                key={'selected-filter-operand'}
                onClick={() => setIsOptionUnfolded(true)}
              >
                {selectedFilterOperand.label}

                <DropdownButton.StyledDropdownTopOptionAngleDown />
              </DropdownButton.StyledDropdownTopOption>,
              someFieldRandomValue.map((value, index) => (
                <DropdownButton.StyledDropdownItem
                  key={`fields-value-${index}`}
                  onClick={() => {
                    setFilters([
                      {
                        id: value,
                        operand: selectedFilterOperand,
                        label: selectedFilter.label,
                        value: value,
                        icon: selectedFilter.icon,
                      },
                    ]);
                    setIsUnfolded(false);
                    setSelectedFilter(undefined);
                  }}
                >
                  {value}
                </DropdownButton.StyledDropdownItem>
              )),
            ]
        : availableFilters.map((filter, index) => (
            <DropdownButton.StyledDropdownItem
              key={`select-filter-${index}`}
              onClick={() => {
                setSelectedFilter(filter);
              }}
            >
              <DropdownButton.StyledIcon>
                {filter.icon && <FontAwesomeIcon icon={filter.icon} />}
              </DropdownButton.StyledIcon>
              {filter.label}
            </DropdownButton.StyledDropdownItem>
          ))}
    </DropdownButton>
  );
}
