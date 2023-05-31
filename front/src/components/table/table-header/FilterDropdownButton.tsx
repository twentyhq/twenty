import { ChangeEvent, useCallback, useState } from 'react';
import DropdownButton from './DropdownButton';
import {
  FilterConfigType,
  FilterOperandType,
  FilterableFieldsType,
  SelectedFilterType,
} from '../../../interfaces/filters/interface';
import {
  SearchResultsType,
  useSearch,
} from '../../../services/api/search/search';
import DatePicker from '../../form/DatePicker';
import styled from '@emotion/styled';
import { humanReadableDate } from '../../../services/utils';

type OwnProps<TData extends FilterableFieldsType> = {
  isFilterSelected: boolean;
  availableFilters: FilterConfigType<TData>[];
  onFilterSelect: (filter: SelectedFilterType<TData>) => void;
  onFilterRemove: (filterId: SelectedFilterType<TData>['key']) => void;
};

export const FilterDropdownButton = <TData extends FilterableFieldsType>({
  availableFilters,
  onFilterSelect,
  isFilterSelected,
  onFilterRemove,
}: OwnProps<TData>) => {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    FilterConfigType<TData> | undefined
  >(undefined);

  const [selectedFilterOperand, setSelectedFilterOperand] = useState<
    FilterOperandType<TData> | undefined
  >(undefined);

  const [filterSearchResults, setSearchInput, setFilterSearch] = useSearch();

  const resetState = useCallback(() => {
    setIsOperandSelectionUnfolded(false);
    setSelectedFilter(undefined);
    setSelectedFilterOperand(undefined);
    setFilterSearch(null);
  }, [setFilterSearch]);

  const renderOperandSelection = selectedFilter?.operands.map(
    (filterOperand, index) => (
      <DropdownButton.StyledDropdownItem
        key={`select-filter-operand-${index}`}
        onClick={() => {
          setSelectedFilterOperand(filterOperand);
          setIsOperandSelectionUnfolded(false);
        }}
      >
        {filterOperand.label}
      </DropdownButton.StyledDropdownItem>
    ),
  );

  const renderFilterSelection = availableFilters.map((filter, index) => (
    <DropdownButton.StyledDropdownItem
      key={`select-filter-${index}`}
      onClick={() => {
        setSelectedFilter(filter);
        setSelectedFilterOperand(filter.operands[0]);
        filter.searchConfig && setFilterSearch(filter.searchConfig);
        setSearchInput('');
      }}
    >
      <DropdownButton.StyledIcon>{filter.icon}</DropdownButton.StyledIcon>
      {filter.label}
    </DropdownButton.StyledDropdownItem>
  ));

  const renderSearchResults = (
    filterSearchResults: SearchResultsType,
    selectedFilter: FilterConfigType<TData>,
    selectedFilterOperand: FilterOperandType<TData>,
  ) => {
    if (filterSearchResults.loading) {
      return (
        <DropdownButton.StyledDropdownItem data-testid="loading-search-results">
          Loading
        </DropdownButton.StyledDropdownItem>
      );
    }

    return filterSearchResults.results.map((result, index) => {
      return (
        <DropdownButton.StyledDropdownItem
          key={`fields-value-${index}`}
          onClick={() => {
            onFilterSelect({
              key: selectedFilter.key,
              label: selectedFilter.label,
              value: result.value,
              displayValue: result.render(result.value),
              icon: selectedFilter.icon,
              operand: selectedFilterOperand,
            });
            setIsUnfolded(false);
            setSelectedFilter(undefined);
          }}
        >
          <DropdownButton.StyledDropdownItemClipped>
            {result.render(result.value)}
          </DropdownButton.StyledDropdownItemClipped>
        </DropdownButton.StyledDropdownItem>
      );
    });
  };

  function renderValueSelection(
    selectedFilter: FilterConfigType<TData>,
    selectedFilterOperand: FilterOperandType<TData>,
  ) {
    return (
      <>
        <DropdownButton.StyledDropdownTopOption
          key={'selected-filter-operand'}
          onClick={() => setIsOperandSelectionUnfolded(true)}
        >
          {selectedFilterOperand.label}

          <DropdownButton.StyledDropdownTopOptionAngleDown />
        </DropdownButton.StyledDropdownTopOption>
        <DropdownButton.StyledSearchField key={'search-filter'}>
          {['text', 'relation'].includes(selectedFilter.type) && (
            <input
              type="text"
              placeholder={selectedFilter.label}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (
                  selectedFilter.type === 'relation' &&
                  selectedFilter.searchConfig
                ) {
                  setFilterSearch(selectedFilter.searchConfig);
                  setSearchInput(event.target.value);
                }

                if (selectedFilter.type === 'text') {
                  if (event.target.value === '') {
                    onFilterRemove(selectedFilter.key);
                  } else {
                    onFilterSelect({
                      key: selectedFilter.key,
                      label: selectedFilter.label,
                      value: event.target.value,
                      displayValue: event.target.value,
                      icon: selectedFilter.icon,
                      operand: selectedFilterOperand,
                    });
                  }
                }
              }}
            />
          )}
          {selectedFilter.type === 'date' && (
            <DatePicker
              date={new Date()}
              onChangeHandler={(date) => {
                onFilterSelect({
                  key: selectedFilter.key,
                  label: selectedFilter.label,
                  value: date.toISOString(),
                  displayValue: humanReadableDate(date),
                  icon: selectedFilter.icon,
                  operand: selectedFilterOperand,
                });
              }}
              customInput={<></>}
              customCalendarContainer={styled.div`
                top: -10px;
              `}
            />
          )}
        </DropdownButton.StyledSearchField>
        {selectedFilter.type === 'relation' &&
          filterSearchResults &&
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
      {selectedFilter
        ? isOperandSelectionUnfolded
          ? renderOperandSelection
          : renderValueSelection(selectedFilter, selectedFilterOperand)
        : renderFilterSelection}
    </DropdownButton>
  );
};
