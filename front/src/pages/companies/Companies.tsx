
import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';


import { useCreateCompany } from '@/companies/hooks/useCreateCompany';
import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  useCompaniesQuery,
} from '@/companies/services';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '@/filters-and-sorts/helpers';
import { SelectedFilterType } from '@/filters-and-sorts/interfaces/filters/interface';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';



import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';
import {

  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput,
  GetCompaniesQuery,
} from '~/generated/graphql';

import { TableActionBarButtonCreateCommentThreadCompany } from './table/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';
import { CompanyTable } from './CompanyTable';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {

  const createCompany = useCreateCompany();
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<CompanyWhereInput>({});

  const { data } = useCompaniesQuery(orderBy, where);

  const companies = data?.companies ?? [];

  const handleAddButtonClick = useCallback(async () => {
    await createCompany();
  }, [createCompany]);

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<GetCompaniesQuery['companies'][0]>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const companiesColumns = useCompaniesColumns();

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title="Companies"
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <RecoilScope SpecificContext={TableContext}>
        <StyledTableContainer>
          <CompanyTable />
        </StyledTableContainer>
        <EntityTableActionBar>
          <TableActionBarButtonCreateCommentThreadCompany />
          <TableActionBarButtonDeleteCompanies />
        </EntityTableActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
