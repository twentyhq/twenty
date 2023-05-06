import { FaRegBuilding, FaList } from 'react-icons/fa';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import styled from '@emotion/styled';
import { useState, useCallback } from 'react';
import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  useCompaniesQuery,
} from '../../services/companies';
import Table from '../../components/table/Table';
import { mapCompany } from '../../interfaces/company.interface';
import {
  companiesColumns,
  availableFilters,
  availableSorts,
} from './companies-table';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import {
  Companies_Bool_Exp,
  Companies_Order_By,
} from '../../generated/graphql';
import { SelectedFilterType } from '../../components/table/table-header/interface';
import { useSearch } from '../../services/search/search';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

function Companies() {
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<Companies_Bool_Exp>({});

  const [filterSearchResults, setSearhInput, setFilterSearch] = useSearch();

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<Companies_Bool_Exp>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data } = useCompaniesQuery(orderBy, where);

  return (
    <WithTopBarContainer title="Companies" icon={<FaRegBuilding />}>
      <StyledCompaniesContainer>
        <Table
          data={data ? data.companies.map(mapCompany) : []}
          columns={companiesColumns}
          viewName="All Companies"
          viewIcon={<FaList />}
          availableSorts={availableSorts}
          availableFilters={availableFilters}
          filterSearchResults={filterSearchResults}
          onSortsUpdate={updateSorts}
          onFiltersUpdate={updateFilters}
          onFilterSearch={(filter, searchValue) => {
            setSearhInput(searchValue);
            setFilterSearch(filter);
          }}
        />
      </StyledCompaniesContainer>
    </WithTopBarContainer>
  );
}

export default Companies;
