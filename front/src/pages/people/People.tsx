import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { PeopleTable } from '@/people/table/components/PeopleTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { DataTableActionBar } from '@/ui/data-table/action-bar/components/DataTableActionBar';
import { DataTableContextMenu } from '@/ui/data-table/context-menu/components/DataTableContextMenu';
import { useUpsertDataTableItem } from '@/ui/data-table/hooks/useUpsertDataTableItem';
import { useUpsertTableRowId } from '@/ui/data-table/hooks/useUpsertTableRowId';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconUser } from '@/ui/icon';
import { PageAddButton } from '@/ui/layout/components/PageAddButton';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/components/PageHotkeysEffect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const People = () => {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const upsertDataTableItem = useUpsertDataTableItem();
  const upsertTableRowIds = useUpsertTableRowId();
  const { triggerOptimisticEffects } = useOptimisticEffect();

  const handleAddButtonClick = async () => {
    const newPersonId: string = v4();
    await insertOnePerson({
      variables: {
        data: {
          id: newPersonId,
          firstName: '',
          lastName: '',
        },
      },
      update: (_cache, { data }) => {
        if (data?.createOnePerson) {
          upsertTableRowIds(data?.createOnePerson.id);
          upsertDataTableItem(data?.createOnePerson);
          triggerOptimisticEffects('Person', [data?.createOnePerson]);
        }
      },
    });
  };

  return (
    <SpreadsheetImportProvider>
      <PageContainer>
        <PageHeader title="People" Icon={IconUser}>
          <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
            <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
            <PageAddButton onClick={handleAddButtonClick} />
          </RecoilScope>
        </PageHeader>
        <PageBody>
          <RecoilScope
            scopeId="people"
            CustomRecoilScopeContext={TableRecoilScopeContext}
          >
            <StyledTableContainer>
              <PeopleTable />
            </StyledTableContainer>
            <DataTableActionBar />
            <DataTableContextMenu />
          </RecoilScope>
        </PageBody>
      </PageContainer>
    </SpreadsheetImportProvider>
  );
};
