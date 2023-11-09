import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { PersonTable } from '@/people/table/components/PersonTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { IconUser } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useUpsertTableRowId } from '@/ui/object/record-table/hooks/useUpsertTableRowId';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const People = () => {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const { upsertRecordTableItem } = useRecordTable({
    recordTableScopeId: 'people',
  });
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
          upsertRecordTableItem(data?.createOnePerson);
          triggerOptimisticEffects('Person', [data?.createOnePerson]);
        }
      },
    });
  };

  return (
    <SpreadsheetImportProvider>
      <PageContainer>
        <PageHeader title="People" Icon={IconUser}>
          <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
          <PageAddButton onClick={handleAddButtonClick} />
        </PageHeader>
        <PageBody>
          <StyledTableContainer>
            <PersonTable />
          </StyledTableContainer>
          <RecordTableActionBar />
          <RecordTableContextMenu />
        </PageBody>
      </PageContainer>
    </SpreadsheetImportProvider>
  );
};
