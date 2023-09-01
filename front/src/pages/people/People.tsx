import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { PeopleTable } from '@/people/table/components/PeopleTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconUser } from '@/ui/icon';
import { PageAddButton } from '@/ui/layout/components/PageAddButton';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { PageHotkeys } from '@/ui/layout/components/PageHotkeys';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { EntityTableContextMenu } from '@/ui/table/context-menu/components/EntityTableContextMenu';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { useUpsertTableRowId } from '@/ui/table/hooks/useUpsertTableRowId';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function People() {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();
  const upsertTableRowIds = useUpsertTableRowId();
  const { triggerOptimisticEffects } = useOptimisticEffect();

  async function handleAddButtonClick() {
    const newPersonId: string = v4();
    await insertOnePerson({
      variables: {
        data: {
          id: newPersonId,
          firstName: '',
          lastName: '',
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createOnePerson: {
          __typename: 'Person',
          id: newPersonId,
          firstName: '',
          lastName: '',
          displayName: '',
          createdAt: '',
        },
      },
      update: (_cache, { data }) => {
        if (data?.createOnePerson) {
          upsertTableRowIds(data?.createOnePerson.id);
          upsertEntityTableItem(data?.createOnePerson);
          triggerOptimisticEffects('Person', [data?.createOnePerson]);
        }
      },
    });
  }

  const theme = useTheme();

  return (
    <SpreadsheetImportProvider>
      <PageContainer>
        <PageHeader
          title="People"
          icon={<IconUser size={theme.icon.size.md} />}
        >
          <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
            <PageHotkeys onAddButtonClick={handleAddButtonClick} />
            <PageAddButton onClick={handleAddButtonClick} />
          </RecoilScope>
        </PageHeader>
        <PageBody>
          <RecoilScope
            scopeId="people"
            SpecificContext={TableRecoilScopeContext}
          >
            <StyledTableContainer>
              <PeopleTable />
            </StyledTableContainer>
            <EntityTableActionBar />
            <EntityTableContextMenu />
          </RecoilScope>
        </PageBody>
      </PageContainer>
    </SpreadsheetImportProvider>
  );
}
