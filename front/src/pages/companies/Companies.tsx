import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 as uuidv4 } from 'uuid';

import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  GET_COMPANIES,
  useCompaniesQuery,
} from '@/companies/services';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '@/filters-and-sorts/helpers';
import { SelectedFilterType } from '@/filters-and-sorts/interfaces/filters/interface';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { IconList } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import {
  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput,
  GetCompaniesQuery,
  InsertCompanyMutationVariables,
  useInsertCompanyMutation,
} from '~/generated/graphql';

import { TableActionBarButtonCreateCommentThreadCompany } from './table/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';
import { useCompaniesColumns } from './companies-columns';
import { availableFilters } from './companies-filters';
import { availableSorts } from './companies-sorts';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertCompanyMutation();
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<CompanyWhereInput>({});

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<GetCompaniesQuery['companies'][0]>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data } = useCompaniesQuery(orderBy, where);

  const companies = data?.companies ?? [];

  async function handleAddButtonClick() {
    const newCompany: InsertCompanyMutationVariables = {
      id: uuidv4(),
      name: '',
      domainName: '',
      employees: null,
      address: '',
      createdAt: new Date().toISOString(),
    };

    await insertCompany({
      variables: newCompany,
      refetchQueries: [getOperationName(GET_COMPANIES) ?? ''],
    });
  }

  const companiesColumns = useCompaniesColumns();
  const theme = useTheme();
  return (
    <WithTopBarContainer
      title="Companies"
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <>
        <StyledCompaniesContainer>
          <HooksEntityTable
            numberOfColumns={companiesColumns.length}
            numberOfRows={companies.length}
          />
          <EntityTable
            data={companies}
            columns={companiesColumns}
            viewName="All Companies"
            viewIcon={<IconList size={16} />}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
          />
        </StyledCompaniesContainer>
        <EntityTableActionBar>
          <TableActionBarButtonCreateCommentThreadCompany />
          <TableActionBarButtonDeleteCompanies />
        </EntityTableActionBar>
      </>
    </WithTopBarContainer>
  );
}
