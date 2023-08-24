import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { SEARCH_COMPANY_QUERY } from '@/search/graphql/queries/searchCompanyQuery';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { EntityTableContextMenu } from '@/ui/table/context-menu/components/EntityTableContextMenu';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { useUpsertTableRowId } from '@/ui/table/hooks/useUpsertTableRowId';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertOneCompanyMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();
  const upsertTableRowIds = useUpsertTableRowId();

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
          createdAt: new Date().toISOString(),
          accountOwner: null,
          linkedinUrl: '',
          idealCustomerProfile: false,
          employees: null,
        },
      },
      update: (cache, { data }) => {
        if (data?.createOneCompany) {
          upsertTableRowIds(data?.createOneCompany.id);
          upsertEntityTableItem(data?.createOneCompany);
        }
      },
      refetchQueries: [getOperationName(SEARCH_COMPANY_QUERY) ?? ''],
    });
  }

  const theme = useTheme();

  return (
    <SpreadsheetImportProvider>
      <WithTopBarContainer
        title="Companies"
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
        onAddButtonClick={handleAddButtonClick}
      >
        <RecoilScope
          scopeId="companies"
          SpecificContext={TableRecoilScopeContext}
        >
          <StyledTableContainer>
            <CompanyTable />
          </StyledTableContainer>
          <EntityTableActionBar />
          <EntityTableContextMenu />
        </RecoilScope>
      </WithTopBarContainer>
    </SpreadsheetImportProvider>
  );
}
