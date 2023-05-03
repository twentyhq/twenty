import { FaRegBuilding, FaList } from 'react-icons/fa';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import styled from '@emotion/styled';
import { useState, useCallback } from 'react';
import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  reduceSortsToOrderBy,
  useCompaniesQuery,
} from '../../services/companies';
import Table from '../../components/table/Table';
import { mapCompany } from '../../interfaces/company.interface';
import { companiesColumns, sortsAvailable } from './companies-table';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

function Companies() {
  const [, setSorts] = useState([] as Array<CompaniesSelectedSortType>);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setSorts(sorts);
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const { data } = useCompaniesQuery(orderBy);

  return (
    <WithTopBarContainer title="Companies" icon={<FaRegBuilding />}>
      <StyledCompaniesContainer>
        <Table
          data={data ? data.companies.map(mapCompany) : []}
          columns={companiesColumns}
          viewName="All Companies"
          viewIcon={<FaList />}
          onSortsUpdate={updateSorts}
          availableSorts={sortsAvailable}
        />
      </StyledCompaniesContainer>
    </WithTopBarContainer>
  );
}

export default Companies;
