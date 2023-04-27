import { ChangeEvent, useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilterType, SelectedFilterType } from './interface';

type OwnProps = {
  isFilterSelected: boolean;
  availableFilters: FilterType[];
  filterSearchResults?: string[];
  onFilterSelect: (filter: SelectedFilterType) => void;
  onFilterSearch: (filterKey: string, filterValue: string) => void;
};

type FilterOperandType = { label: string; id: string };

const filterOperands: FilterOperandType[] = [
  { label: 'Include', id: 'include' },
  { label: "Doesn't include", id: 'not-include' },
];

export function FilterDropdownButton({
  availableFilters,
  filterSearchResults,
  onFilterSearch,
  onFilterSelect,
  isFilterSelected,
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

  const renderSelectOptionItems = filterOperands.map((filterOperand, index) => (
    <DropdownButton.StyledDropdownItem
      key={`select-filter-operand-${index}`}
      onClick={() => {
        setSelectedFilterOperand(filterOperand);
        setIsOptionUnfolded(false);
      }}
    >
      {filterOperand.label}
    </DropdownButton.StyledDropdownItem>
  ));

  const renderSelectFilterITems = availableFilters.map((filter, index) => (
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
  ));

  function renderFilterDropdown(selectedFilter: FilterType) {
    return (
      <>
        <DropdownButton.StyledDropdownTopOption
          key={'selected-filter-operand'}
          onClick={() => setIsOptionUnfolded(true)}
        >
          {selectedFilterOperand.label}

          <DropdownButton.StyledDropdownTopOptionAngleDown />
        </DropdownButton.StyledDropdownTopOption>
        <DropdownButton.StyledSearchField key={'search-filter'}>
          <input
            type="text"
            placeholder={selectedFilter.label}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onFilterSearch(selectedFilter.key, event.target.value)
            }
          />
        </DropdownButton.StyledSearchField>
        {filterSearchResults &&
          filterSearchResults.map((value, index) => (
            <DropdownButton.StyledDropdownItem
              key={`fields-value-${index}`}
              onClick={() => {
                onFilterSelect({
                  id: value,
                  operand: selectedFilterOperand,
                  label: selectedFilter.label,
                  value: value,
                  icon: selectedFilter.icon,
                });
                setIsUnfolded(false);
                setSelectedFilter(undefined);
              }}
            >
              {value}
            </DropdownButton.StyledDropdownItem>
          ))}
      </>
    );
  }

  return (
    <DropdownButton
      label="Filter"
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
      resetState={resetState}
    >
      {selectedFilter
        ? isOptionUnfolded
          ? renderSelectOptionItems
          : renderFilterDropdown(selectedFilter)
        : renderSelectFilterITems}
    </DropdownButton>
  );
}
