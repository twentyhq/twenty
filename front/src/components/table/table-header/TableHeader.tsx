import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownButton from './DropdownButton';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  FilterType,
  SelectedFilterType,
  SelectedSortType,
  SortType,
} from './interface';
import { useCallback, useState } from 'react';
import { SortDropdownButton } from './SortDropdownButton';
import { FilterDropdownButton } from './FilterDropdownButton';
import SortAndFilterBar from './SortAndFilterBar';

type OwnProps<SortField> = {
  viewName: string;
  viewIcon?: IconProp;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterType[];
  filterSearchResults?: Array<string>;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onFiltersUpdate?: (sorts: Array<SelectedFilterType>) => void;
  onFilterSearch?: (filterKey: string, filterValue: string) => void;
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

function TableHeader<SortField extends string>({
  viewName,
  viewIcon,
  availableSorts,
  availableFilters,
  filterSearchResults,
  onSortsUpdate,
  onFiltersUpdate,
  onFilterSearch,
}: OwnProps<SortField>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortField>>>(
    [],
  );
  const [filters, innerSetFilters] = useState<Array<SelectedFilterType>>([]);

  const sortSelect = useCallback(
    (sort: SelectedSortType<SortField>) => {
      innerSetSorts([sort]);
      onSortsUpdate && onSortsUpdate([sort]);
    },
    [onSortsUpdate],
  );

  const sortUnselect = useCallback(
    (sortId: string) => {
      const newSorts = [] as SelectedSortType<SortField>[];
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate],
  );

  const filterSelect = useCallback(
    (filter: SelectedFilterType) => {
      innerSetFilters([filter]);
      onFiltersUpdate && onFiltersUpdate([filter]);
    },
    [onFiltersUpdate],
  );

  const filterUnselect = useCallback(
    (filterId: SelectedFilterType['id']) => {
      const newFilters = [] as SelectedFilterType[];
      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate],
  );

  const filterSearch = useCallback(
    (filterKey: string, filterValue: string) => {
      onFilterSearch && onFilterSearch(filterKey, filterValue);
    },
    [onFilterSearch],
  );

  return (
    <StyledContainer>
      <StyledTableHeader>
        <StyledViewSection>
          <StyledIcon>
            {viewIcon && <FontAwesomeIcon icon={viewIcon} />}
          </StyledIcon>
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
