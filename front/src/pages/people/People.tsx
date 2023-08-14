import { useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useOpenActionBar } from '@/people/hooks/useOpenActionBar';
import { useOpenContextMenu } from '@/people/hooks/useOpenContextMenu';
import { PeopleTable } from '@/people/table/components/PeopleTable';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { EntityTableContextMenu } from '@/ui/table/context-menu/components/EntityTableContextMenu';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { useUpsertTableRowId } from '@/ui/table/hooks/useUpsertTableRowId';
import { TableContext } from '@/ui/table/states/TableContext';
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
      update: (cache, { data }) => {
        if (data?.createOnePerson) {
          upsertTableRowIds(data?.createOnePerson.id);
          upsertEntityTableItem(data?.createOnePerson);
        }
      },
    });
  }

  const theme = useTheme();

  const setContextMenu = useOpenContextMenu();
  const setActionBar = useOpenActionBar();

  useEffect(() => {
    setContextMenu();
    setActionBar();
  }, [setContextMenu, setActionBar]);

  return (
    <RecoilScope SpecificContext={TableContext}>
      <WithTopBarContainer
        title="People"
        icon={<IconUser size={theme.icon.size.sm} />}
        onAddButtonClick={handleAddButtonClick}
      >
        <StyledTableContainer>
          <PeopleTable />
        </StyledTableContainer>
        <EntityTableActionBar></EntityTableActionBar>
        <EntityTableContextMenu></EntityTableContextMenu>
      </WithTopBarContainer>
    </RecoilScope>
  );
}
