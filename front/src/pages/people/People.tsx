import { useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { GET_PEOPLE } from '@/people/queries';
import { PeopleTable } from '@/people/table/components/PeopleTable';
import { TableActionBarButtonCreateActivityPeople } from '@/people/table/components/TableActionBarButtonCreateActivityPeople';
import { TableActionBarButtonDeletePeople } from '@/people/table/components/TableActionBarButtonDeletePeople';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { snackBarInternalState } from '@/ui/snack-bar/states/snackBarState';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOnePersonMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function People() {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const id = uuidv4();

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

  const setSnackBarState = useSetRecoilState(snackBarInternalState);

  useEffect(() => {
    return () => {
      // Clear the snackbar queue when the component unmounts
      // This will subsequently cancel the deletion of items
      setSnackBarState((prevState) => ({
        ...prevState,
        queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
      }));
    };
  }, [id, setSnackBarState]);

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
          <TableActionBarButtonDeletePeople id={id} />
        </EntityTableActionBar>
      </WithTopBarContainer>
    </RecoilScope>
  );
}
