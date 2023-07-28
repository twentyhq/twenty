import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { GET_PEOPLE } from '@/people/queries';
import { PeopleTable } from '@/people/table/components/PeopleTableV2';
import { TableActionBarButtonCreateActivityPeople } from '@/people/table/components/TableActionBarButtonCreateActivityPeople';
import { TableActionBarButtonDeletePeople } from '@/people/table/components/TableActionBarButtonDeletePeople';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function People() {
  const [insertOnePerson] = useInsertOnePersonMutation();

  async function handleAddButtonClick() {
    await insertOnePerson({
      variables: {
        data: {
          firstName: '',
          lastName: '',
        },
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
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
