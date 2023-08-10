import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { TableActionBarButtonCreateActivityCompany } from '@/companies/table/components/TableActionBarButtonCreateActivityCompany';
import { TableActionBarButtonDeleteCompanies } from '@/companies/table/components/TableActionBarButtonDeleteCompanies';
import { SEARCH_COMPANY_QUERY } from '@/search/queries/search';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertOneCompanyMutation();
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  async function handleAddButtonClick() {
    const newCompanyId: string = v4();
    await insertCompany({
      variables: {
        data: {
          id: newCompanyId,
          name: '',
          domainName: '',
          address: '',
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createOneCompany: {
          __typename: 'Company',
          id: newCompanyId,
          name: '',
          domainName: '',
          address: '',
          createdAt: '',
        },
      },
      update: (cache, { data }) => {
        data?.createOneCompany.id &&
          setTableRowIds([data?.createOneCompany.id, ...tableRowIds]);
      },
      refetchQueries: [getOperationName(SEARCH_COMPANY_QUERY) ?? ''],
    });
  }

  const theme = useTheme();

  return (
    <>
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
            <TableActionBarButtonCreateActivityCompany />
            <TableActionBarButtonDeleteCompanies />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
