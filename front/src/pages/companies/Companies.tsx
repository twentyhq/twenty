import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { SEARCH_COMPANY_QUERY } from '@/search/graphql/queries/searchCompanyQuery';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useUpsertTableRowId } from '@/ui/object/record-table/hooks/useUpsertTableRowId';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const Companies = () => {
  const [insertCompany] = useInsertOneCompanyMutation();
  const { upsertRecordTableItem } = useRecordTable({
    recordTableScopeId: 'companies',
  });
  const upsertTableRowIds = useUpsertTableRowId();
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular: 'company',
  });

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
          upsertRecordTableItem(data?.createOneCompany);
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
          <StyledTableContainer>
            <CompanyTable />
          </StyledTableContainer>
          <RecordTableActionBar />
          <RecordTableContextMenu />
        </PageBody>
      </PageContainer>
    </SpreadsheetImportProvider>
  );
};
