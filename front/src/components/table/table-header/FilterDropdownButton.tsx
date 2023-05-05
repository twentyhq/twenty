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

  const [selectedFilterOperand, setSelectedFilterOperand] = useState<
    FilterOperandType | undefined
  >(undefined);

  const resetState = useCallback(() => {
    setIsOptionUnfolded(false);
    setSelectedFilter(undefined);
    setSelectedFilterOperand(undefined);
    onFilterSearch(null, '');
  }, [onFilterSearch]);

  const renderSelectOptionItems = selectedFilter?.operands.map(
    (filterOperand, index) => (
      <DropdownButton.StyledDropdownItem
        key={`select-filter-operand-${index}`}
        onClick={() => {
          setSelectedFilterOperand(filterOperand);
          setIsOptionUnfolded(false);
        }}
      >
        {filterOperand.label}
      </DropdownButton.StyledDropdownItem>
    ),
  );

  const renderSearchResults = (
    filterSearchResults: NonNullable<
      OwnProps<FilterProperties>['filterSearchResults']
    >,
    selectedFilter: FilterType<FilterProperties>,
    selectedFilterOperand: FilterOperandType,
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
        setSelectedFilterOperand(filter.operands[0]);
        onFilterSearch(filter, '');
      }}
    >
      <DropdownButton.StyledIcon>{filter.icon}</DropdownButton.StyledIcon>
      {filter.label}
    </DropdownButton.StyledDropdownItem>
  ));

  function renderFilterDropdown(
    selectedFilter: FilterType<FilterProperties>,
    selectedFilterOperand: FilterOperandType,
  ) {
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
          renderSearchResults(
            filterSearchResults,
            selectedFilter,
            selectedFilterOperand,
          )}
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
      {selectedFilter && selectedFilterOperand
        ? isOptionUnfolded
          ? renderSelectOptionItems
          : renderFilterDropdown(selectedFilter, selectedFilterOperand)
        : renderSelectFilterITems}
    </DropdownButton>
  );
}
