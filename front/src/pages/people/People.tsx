import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { PeopleTable } from '@/people/table/components/PeopleTable';
import { TableActionBarButtonCreateActivityPeople } from '@/people/table/components/TableActionBarButtonCreateActivityPeople';
import { TableActionBarButtonDeletePeople } from '@/people/table/components/TableActionBarButtonDeletePeople';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function People() {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

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
        data?.createOnePerson?.id &&
          setTableRowIds([data?.createOnePerson.id, ...tableRowIds]);
      },
    });
  }

  const theme = useTheme();

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
        <EntityTableActionBar>
          <TableActionBarButtonCreateActivityPeople />
          <TableActionBarButtonDeletePeople />
        </EntityTableActionBar>
      </WithTopBarContainer>
    </RecoilScope>
  );
}
