import { useCallback, useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { queuedActionsState } from '@/command-menu/states/queuedAction';
import { GET_PEOPLE } from '@/people/services';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useInsertPersonMutation } from '~/generated/graphql';

import { TableActionBarButtonCreateCommentThreadPeople } from './table/TableActionBarButtonCreateCommentThreadPeople';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { PeopleTable } from './PeopleTable';

const StyledPeopleContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function People() {
  const [insertPersonMutation] = useInsertPersonMutation();

  const [queuedActions, setQueuedActions] = useRecoilState(queuedActionsState);

  const handleAddButtonClick = useCallback(async () => {
    await insertPersonMutation({
      variables: {
        id: uuidv4(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        createdAt: new Date().toISOString(),
        city: '',
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }, [insertPersonMutation]);

  useEffect(() => {
    if (queuedActions.includes('people/create_people')) {
      handleAddButtonClick();
      setQueuedActions(
        queuedActions.filter((action) => action !== 'people/create_people'),
      );
    }
  }, [queuedActions, handleAddButtonClick, setQueuedActions]);

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title="People"
      icon={<IconUser size={theme.icon.size.md} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <RecoilScope SpecificContext={TableContext}>
        <StyledPeopleContainer>
          <PeopleTable />
        </StyledPeopleContainer>
        <EntityTableActionBar>
          <TableActionBarButtonCreateCommentThreadPeople />
          <TableActionBarButtonDeletePeople />
        </EntityTableActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
