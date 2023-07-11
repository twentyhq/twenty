import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import { v4 as uuidv4 } from 'uuid';

import { GET_PEOPLE } from '@/people/services';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { FlexExpandingContainer } from '@/ui/layout/containers/FlexExpandingContainer';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useInsertPersonMutation } from '~/generated/graphql';

import { TableActionBarButtonCreateCommentThreadPeople } from './table/TableActionBarButtonCreateCommentThreadPeople';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { PeopleTable } from './PeopleTable';

export function People() {
  console.log('People');

  const [insertPersonMutation] = useInsertPersonMutation();

  async function handleAddButtonClick() {
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
  }

  const theme = useTheme();

  return (
    <RecoilScope SpecificContext={TableContext}>
      <WithTopBarContainer
        title="Companies"
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
        onAddButtonClick={handleAddButtonClick}
      >
        <FlexExpandingContainer>
          <PeopleTable />
        </FlexExpandingContainer>
        <EntityTableActionBar>
          <TableActionBarButtonCreateCommentThreadPeople />
          <TableActionBarButtonDeletePeople />
        </EntityTableActionBar>
      </WithTopBarContainer>
    </RecoilScope>
  );
}
