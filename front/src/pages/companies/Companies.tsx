import { useState, useCallback } from 'react';
import { FaList } from 'react-icons/fa';
import styled from '@emotion/styled';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import { v4 as uuidv4 } from 'uuid';
import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  insertCompany,
  useCompaniesQuery,
} from '../../services/api/companies';
import { EntityTable } from '../../components/table/EntityTable';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';

import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import { CompanyOrderByWithRelationInput as Companies_Order_By } from '../../generated/graphql';
import { SelectedFilterType } from '../../interfaces/filters/interface';
import { BoolExpType } from '../../interfaces/entities/generic.interface';
import { useCompaniesColumns } from './companies-columns';
import { availableSorts } from './companies-sorts';
import { availableFilters } from './companies-filters';
import { TbBuilding } from 'react-icons/tb';
import { EntityTableActionBar } from '../../components/table/action-bar/EntityTableActionBar';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

function Companies() {
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<BoolExpType<Company>>({});

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<Company>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data } = useCompaniesQuery(orderBy, where);

  const companies = data?.companies.map(mapToCompany) ?? [];

  async function handleAddButtonClick() {
    const newCompany: Company = {
      id: uuidv4(),
      name: '',
      domainName: '',
      employees: null,
      address: '',
      pipes: [],
      createdAt: new Date(),
      accountOwner: null,
      __typename: 'companies',
    };

    await insertCompany(newCompany);
  }

  const companiesColumns = useCompaniesColumns();

  return (
    <WithTopBarContainer
      title="Companies"
      icon={<TbBuilding size={16} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <>
        <StyledCompaniesContainer>
          <EntityTable
            data={companies}
            columns={companiesColumns}
            viewName="All Companies"
            viewIcon={<FaList />}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
          />
        </StyledCompaniesContainer>
        <EntityTableActionBar>
          <TableActionBarButtonDeleteCompanies />
        </EntityTableActionBar>
      </>
    </WithTopBarContainer>
  );
}

export default Companies;
