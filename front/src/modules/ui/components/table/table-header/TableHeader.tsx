import { ReactNode, useCallback, useState } from 'react';
import styled from '@emotion/styled';

import {
  FilterableFieldsType,
  FilterConfigType,
  SelectedFilterType,
} from '@/filters-and-sorts/interfaces/filters/interface';
import {
  SelectedSortType,
  SortType,
} from '@/filters-and-sorts/interfaces/sorts/interface';

import { FilterDropdownButton } from './FilterDropdownButton';
import SortAndFilterBar from './SortAndFilterBar';
import { SortDropdownButton } from './SortDropdownButton';

type OwnProps<SortField, TData extends FilterableFieldsType> = {
  viewName: string;
  viewIcon?: ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterConfigType<TData>[];
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onFiltersUpdate?: (sorts: Array<SelectedFilterType<TData>>) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTableHeader = styled.div`
  align-items: center;
  color: ${(props) => props.theme.text60};
  display: flex;
  flex-direction: row;
  font-weight: 500;
  height: 40px;
  justify-content: space-between;
  padding-left: ${(props) => props.theme.spacing(3)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(2)};

  & > svg {
    font-size: ${(props) => props.theme.iconSizeSmall};
  }
`;

const StyledViewSection = styled.div`
  display: flex;
`;

const StyledFilters = styled.div`
  display: flex;
  font-weight: 400;
  gap: 2px;
`;

export function TableHeader<SortField, TData extends FilterableFieldsType>({
  viewName,
  viewIcon,
  availableSorts,
  availableFilters,
  onSortsUpdate,
  onFiltersUpdate,
}: OwnProps<SortField, TData>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortField>>>(
    [],
  );
  const [filters, innerSetFilters] = useState<Array<SelectedFilterType<TData>>>(
    [],
  );

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
    (filter: SelectedFilterType<TData>) => {
      const newFilters = updateSortOrFilterByKey(filters, filter);

      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate, filters],
  );

  const filterUnselect = useCallback(
    (filterId: SelectedFilterType<TData>['key']) => {
      const newFilters = filters.filter((filter) => filter.key !== filterId);
      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate, filters],
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
            onFilterSelect={filterSelect}
            onFilterRemove={filterUnselect}
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
