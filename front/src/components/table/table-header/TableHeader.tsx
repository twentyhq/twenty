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

function TableHeader<SortField extends string, FilterProperties>({
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
      const newSorts = updateSortByKey(sorts, newSort);
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
      innerSetFilters([filter]);
      onFiltersUpdate && onFiltersUpdate([filter]);
    },
    [onFiltersUpdate],
  );

  const filterUnselect = useCallback(
    (filterId: SelectedFilterType<FilterProperties>['key']) => {
      const newFilters = [] as SelectedFilterType<FilterProperties>[];
      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate],
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

          <DropdownButton label="Settings" isActive={false}></DropdownButton>
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length + filters.length > 0 && (
        <SortAndFilterBar
          sorts={sorts}
          filters={filters}
          onRemoveSort={sortUnselect}
          onRemoveFilter={filterUnselect}
        />
      )}
    </StyledContainer>
  );
}

export default TableHeader;

function updateSortByKey<Sort extends { key: string }>(
  sorts: Sort[],
  newSort: Sort,
): Sort[] {
  const existingSortIndex = sorts.findIndex((sort) => sort.key === newSort.key);

  if (existingSortIndex !== -1) {
    sorts[existingSortIndex] = newSort;
  } else {
    sorts.push(newSort);
  }

  return sorts;
}
