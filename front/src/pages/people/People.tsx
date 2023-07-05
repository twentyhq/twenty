import { useCallback, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { queuedActionsState } from '@/command-menu/states/queuedActionsState';
import { useCreatePerson } from '@/people/hooks/useCreatePerson';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';

import { TableActionBarButtonCreateCommentThreadPeople } from './table/TableActionBarButtonCreateCommentThreadPeople';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { PeopleTable } from './PeopleTable';

const StyledPeopleContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function People() {
  const createPerson = useCreatePerson();

  const [queuedActions, setQueuedActions] = useRecoilState(queuedActionsState);

  const handleAddButtonClick = useCallback(async () => {
    await createPerson();
  }, [createPerson]);

  useEffect(() => {
    const actionIndex = queuedActions.findIndex(
      (action) => action.action === 'people/create_people',
    );
    if (actionIndex !== -1) {
      handleAddButtonClick();
      setQueuedActions(
        queuedActions.filter((_, index) => index !== actionIndex),
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
