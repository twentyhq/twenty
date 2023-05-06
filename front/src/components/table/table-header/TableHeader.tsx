import styled from '@emotion/styled';
import DropdownButton from './DropdownButton';
import {
  FilterType,
  SelectedFilterType,
  SelectedSortType,
  SortType,
} from './interface';
import { ReactNode, useCallback, useState } from 'react';
import { SortDropdownButton } from './SortDropdownButton';
import { FilterDropdownButton } from './FilterDropdownButton';
import SortAndFilterBar from './SortAndFilterBar';

type OwnProps<SortField, FilterProperties> = {
  viewName: string;
  viewIcon?: ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterType<FilterProperties>[];
  filterSearchResults?: {
    results: { displayValue: string; value: any }[];
    loading: boolean;
  };
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onFiltersUpdate?: (
    sorts: Array<SelectedFilterType<FilterProperties>>,
  ) => void;
  onFilterSearch?: (
    filter: FilterType<FilterProperties> | null,
    searchValue: string,
  ) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTableHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  color: ${(props) => props.theme.text60};
  font-weight: 500;
  padding-left: ${(props) => props.theme.spacing(3)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(2)};

  & > svg {
    font-size: ${(props) => props.theme.fontSizeLarge};
  }
`;

const StyledViewSection = styled.div`
  display: flex;
`;

const StyledFilters = styled.div`
  display: flex;
  font-weight: 400;
  margin-right: ${(props) => props.theme.spacing(2)};
`;

function TableHeader<SortField, FilterProperties>({
  viewName,
  viewIcon,
  availableSorts,
  availableFilters,
  filterSearchResults,
  onSortsUpdate,
  onFiltersUpdate,
  onFilterSearch,
}: OwnProps<SortField, FilterProperties>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortField>>>(
    [],
  );
  const [filters, innerSetFilters] = useState<
    Array<SelectedFilterType<FilterProperties>>
  >([]);

  const sortSelect = useCallback(
    (newSort: SelectedSortType<SortField>) => {
      const newSorts = updateSortOrFilterByKey(sorts, newSort);
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate, sorts],
  );

  const sortUnselect = useCallback(
    (sortKey: string) => {
      const newSorts = sorts.filter((sort) => sort.key !== sortKey);
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate, sorts],
  );

  const filterSelect = useCallback(
    (filter: SelectedFilterType<FilterProperties>) => {
      const newFilters = updateSortOrFilterByKey(filters, filter);

      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate, filters],
  );

  const filterUnselect = useCallback(
    (filterId: SelectedFilterType<FilterProperties>['key']) => {
      const newFilters = filters.filter((filter) => filter.key !== filterId);
      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate, filters],
  );

  const filterSearch = useCallback(
    (filter: FilterType<FilterProperties> | null, searchValue: string) => {
      onFilterSearch && onFilterSearch(filter, searchValue);
    },
    [onFilterSearch],
  );

  return (
    <StyledContainer>
      <StyledTableHeader>
        <StyledViewSection>
          <StyledIcon>{viewIcon}</StyledIcon>
          {viewName}
        </StyledViewSection>
        <StyledFilters>
          <FilterDropdownButton
            isFilterSelected={filters.length > 0}
            availableFilters={availableFilters || []}
            filterSearchResults={filterSearchResults}
            onFilterSelect={filterSelect}
            onFilterSearch={filterSearch}
          />
          <SortDropdownButton<SortField>
            isSortSelected={sorts.length > 0}
            availableSorts={availableSorts || []}
            onSortSelect={sortSelect}
          />
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length + filters.length > 0 && (
        <SortAndFilterBar
          sorts={sorts}
          filters={filters}
          onRemoveSort={sortUnselect}
          onRemoveFilter={filterUnselect}
          onCancelClick={() => {
            innerSetFilters([]);
            onFiltersUpdate && onFiltersUpdate([]);
            innerSetSorts([]);
            onSortsUpdate && onSortsUpdate([]);
          }}
        />
      )}
    </StyledContainer>
  );
}

export default TableHeader;

function updateSortOrFilterByKey<SortOrFilter extends { key: string }>(
  sorts: Readonly<SortOrFilter[]>,
  newSort: SortOrFilter,
): SortOrFilter[] {
  const newSorts = [...sorts];
  const existingSortIndex = sorts.findIndex((sort) => sort.key === newSort.key);

  if (existingSortIndex !== -1) {
    newSorts[existingSortIndex] = newSort;
  } else {
    newSorts.push(newSort);
  }

  return newSorts;
}
