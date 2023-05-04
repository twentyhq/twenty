import { ChangeEvent, useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import { FilterOperandType, FilterType, SelectedFilterType } from './interface';

type OwnProps<FilterProperties> = {
  isFilterSelected: boolean;
  availableFilters: FilterType<FilterProperties>[];
  filterSearchResults?: {
    results: { displayValue: string; value: any }[];
    loading: boolean;
  };
  onFilterSelect: (filter: SelectedFilterType<FilterProperties>) => void;
  onFilterSearch: (
    filter: FilterType<FilterProperties> | null,
    searchValue: string,
  ) => void;
};

const filterOperands: FilterOperandType[] = [
  { label: 'Include', id: 'include', keyWord: 'ilike' },
  { label: "Doesn't include", id: 'not-include', keyWord: 'not_ilike' },
  { label: 'Equal', id: 'equal', keyWord: 'equal' },
  { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
];

export function FilterDropdownButton<FilterProperties>({
  availableFilters,
  filterSearchResults,
  onFilterSearch,
  onFilterSelect,
  isFilterSelected,
}: OwnProps<FilterProperties>) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    FilterType<FilterProperties> | undefined
  >(undefined);

  const [selectedFilterOperand, setSelectedFilterOperand] =
    useState<FilterOperandType>(filterOperands[0]);

  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedFilter(undefined);
    setSelectedFilterOperand(filterOperands[0]);
    onFilterSearch(null, '');
  }, [onFilterSearch]);

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

  const renderSearchResults = (
    filterSearchResults: NonNullable<
      OwnProps<FilterProperties>['filterSearchResults']
    >,
    selectedFilter: FilterType<FilterProperties>,
  ) => {
    if (filterSearchResults.loading) {
      return (
        <DropdownButton.StyledDropdownItem data-testid="loading-search-results">
          Loading
        </DropdownButton.StyledDropdownItem>
      );
    }
    return filterSearchResults.results.map((value, index) => (
      <DropdownButton.StyledDropdownItem
        key={`fields-value-${index}`}
        onClick={() => {
          onFilterSelect({
            ...selectedFilter,
            key: value.displayValue,
            operand: selectedFilterOperand,
            searchQuery: selectedFilter.searchQuery,
            searchTemplate: selectedFilter.searchTemplate,
            whereTemplate: selectedFilter.whereTemplate,
            label: selectedFilter.label,
            value: value.displayValue,
            icon: selectedFilter.icon,
            where: selectedFilter.whereTemplate(
              selectedFilterOperand,
              value.value,
            ),
            searchResultMapper: selectedFilter.searchResultMapper,
          });
          setIsUnfolded(false);
          setSelectedFilter(undefined);
        }}
      >
        {value.displayValue}
      </DropdownButton.StyledDropdownItem>
    ));
  };

  const renderSelectFilterITems = availableFilters.map((filter, index) => (
    <DropdownButton.StyledDropdownItem
      key={`select-filter-${index}`}
      onClick={() => {
        setSelectedFilter(filter);
        onFilterSearch(filter, '');
      }}
    >
      <DropdownButton.StyledIcon>{filter.icon}</DropdownButton.StyledIcon>
      {filter.label}
    </DropdownButton.StyledDropdownItem>
  ));

  function renderFilterDropdown(selectedFilter: FilterType<FilterProperties>) {
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
              onFilterSearch(selectedFilter, event.target.value)
            }
          />
        </DropdownButton.StyledSearchField>
        {filterSearchResults &&
          renderSearchResults(filterSearchResults, selectedFilter)}
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
