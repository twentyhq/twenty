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
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onFiltersUpdate?: (sorts: Array<SelectedFilterType>) => void;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterType[];
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
  onSortsUpdate,
  onFiltersUpdate,
  availableSorts,
  availableFilters,
}: OwnProps<SortField>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortField>>>(
    [],
  );

  const setSorts = useCallback(
    (sorts: SelectedSortType<SortField>[]) => {
      innerSetSorts(sorts);
      onSortsUpdate && onSortsUpdate(sorts);
    },
    [onSortsUpdate],
  );

  const onSortItemUnSelect = useCallback(
    (sortId: string) => {
      const newSorts = [] as SelectedSortType<SortField>[];
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate],
  );

  const [filters, innerSetFilters] = useState<Array<SelectedFilterType>>([]);

  const setFilters = useCallback(
    (filters: SelectedFilterType[]) => {
      innerSetFilters(filters);
      onFiltersUpdate && onFiltersUpdate(filters);
    },
    [onFiltersUpdate],
  );

  const onFilterItemUnSelect = useCallback(
    (filterId: SelectedFilterType['id']) => {
      const newFilters = [] as SelectedFilterType[];
      innerSetFilters(newFilters);
      onFiltersUpdate && onFiltersUpdate(newFilters);
    },
    [onFiltersUpdate],
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
            filters={filters}
            setFilters={setFilters}
            availableFilters={availableFilters || []}
          />
          <SortDropdownButton
            setSorts={setSorts}
            sorts={sorts}
            availableSorts={availableSorts || []}
          />

          <DropdownButton label="Settings" isActive={false}></DropdownButton>
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length + filters.length > 0 && (
        <SortAndFilterBar
          sorts={sorts}
          onRemoveSort={onSortItemUnSelect}
          filters={filters}
          onRemoveFilter={onFilterItemUnSelect}
        />
      )}
    </StyledContainer>
  );
}

export default TableHeader;
