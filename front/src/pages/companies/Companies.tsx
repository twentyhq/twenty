import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { SEARCH_COMPANY_QUERY } from '@/search/graphql/queries/searchCompanyQuery';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { DataTableActionBar } from '@/ui/Data/Data Table/action-bar/components/DataTableActionBar';
import { DataTableContextMenu } from '@/ui/Data/Data Table/context-menu/components/DataTableContextMenu';
import { useUpsertDataTableItem } from '@/ui/Data/Data Table/hooks/useUpsertDataTableItem';
import { useUpsertTableRowId } from '@/ui/Data/Data Table/hooks/useUpsertTableRowId';
import { TableRecoilScopeContext } from '@/ui/Data/Data Table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { IconBuildingSkyscraper } from '@/ui/Display/Icon';
import { PageAddButton } from '@/ui/Layout/Page/PageAddButton';
import { PageBody } from '@/ui/Layout/Page/PageBody';
import { PageContainer } from '@/ui/Layout/Page/PageContainer';
import { PageHeader } from '@/ui/Layout/Page/PageHeader';
import { PageHotkeysEffect } from '@/ui/Layout/Page/PageHotkeysEffect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const Companies = () => {
  const [insertCompany] = useInsertOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();
  const upsertTableRowIds = useUpsertTableRowId();
  const { triggerOptimisticEffects } = useOptimisticEffect();

  const handleAddButtonClick = async () => {
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
      update: (_cache, { data }) => {
        if (data?.createOneCompany) {
          upsertTableRowIds(data?.createOneCompany.id);
          upsertDataTableItem(data?.createOneCompany);
          triggerOptimisticEffects('Company', [data?.createOneCompany]);
        }
      },
      refetchQueries: [getOperationName(SEARCH_COMPANY_QUERY) ?? ''],
    });
  };

  return (
    <SpreadsheetImportProvider>
      <PageContainer>
        <PageHeader title="Companies" Icon={IconBuildingSkyscraper}>
          <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
          <PageAddButton onClick={handleAddButtonClick} />
        </PageHeader>
        <PageBody>
          <RecoilScope
            scopeId="companies"
            CustomRecoilScopeContext={TableRecoilScopeContext}
          >
            <StyledTableContainer>
              <CompanyTable />
            </StyledTableContainer>
            <DataTableActionBar />
            <DataTableContextMenu />
          </RecoilScope>
        </PageBody>
      </PageContainer>
    </SpreadsheetImportProvider>
  );
};
