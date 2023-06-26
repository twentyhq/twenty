import { ChangeEvent, useCallback, useState } from 'react';
import styled from '@emotion/styled';

import {
  FilterableFieldsType,
  FilterConfigType,
  FilterOperandType,
  SelectedFilterType,
} from '@/filters-and-sorts/interfaces/filters/interface';
import { SearchResultsType, useSearch } from '@/search/services/search';
import { humanReadableDate } from '@/utils/utils';

import DatePicker from '../../form/DatePicker';
import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '../../menu/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '../../menu/DropdownMenuSeparator';

import DropdownButton from './DropdownButton';

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

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    FilterConfigType<TData> | undefined
  >(undefined);

  const [selectedFilterOperand, setSelectedFilterOperand] = useState<
    FilterOperandType<TData> | undefined
  >(undefined);

  const [filterSearchResults, setSearchInput, setFilterSearch] =
    useSearch<TData>({ currentSelectedId: selectedEntityId });

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
    filterSearchResults: SearchResultsType<TData>,
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

    function resultIsEntity(result: any): result is { id: string } {
      return Object.keys(result ?? {}).includes('id');
    }

    return (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuItemContainer>
          {filterSearchResults.results.map((result, index) => {
            return (
              <DropdownMenuSelectableItem
                key={`fields-value-${index}`}
                selected={
                  resultIsEntity(result.value) &&
                  result.value.id === selectedEntityId
                }
                onClick={() => {
                  if (resultIsEntity(result.value)) {
                    setSelectedEntityId(result.value.id);
                  }

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
              </DropdownMenuSelectableItem>
            );
          })}
        </DropdownMenuItemContainer>
      </>
    );
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
        <DropdownButton.StyledSearchField autoFocus key={'search-filter'}>
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
                    } as SelectedFilterType<TData>);
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
                } as SelectedFilterType<TData>);
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
      {selectedFilter && selectedFilterOperand
        ? isOperandSelectionUnfolded
          ? renderOperandSelection
          : renderValueSelection(selectedFilter, selectedFilterOperand)
        : renderFilterSelection}
    </DropdownButton>
  );
};
