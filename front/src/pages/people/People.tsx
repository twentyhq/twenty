import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { GET_FAVORITES } from '@/favorites/queries/show';
import { GET_PEOPLE } from '@/people/queries';
import { PeopleTable } from '@/people/table/components/PeopleTable';
import { TableActionBarButtonCreateActivityPeople } from '@/people/table/components/TableActionBarButtonCreateActivityPeople';
import { TableActionBarButtonDeletePeople } from '@/people/table/components/TableActionBarButtonDeletePeople';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { TableContext } from '@/ui/table/states/TableContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOnePersonMutation } from '~/generated/graphql';
import {
  FavoriteCreateManyInput,
  useInsertManyFavoritesMutation,
} from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function People() {
  const [insertOnePerson] = useInsertOnePersonMutation();
  const [insertManyFavorites] = useInsertManyFavoritesMutation();
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const resetRowSelection = useResetTableRowSelection();

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

  async function handleAddFavorite() {
    const rowIdsToFavorite = selectedRowIds;
    if (rowIdsToFavorite.length > 0) {
      resetRowSelection();
      const favorites = rowIdsToFavorite.map((id) => {
        return {
          personId: id,
        } as FavoriteCreateManyInput;
      });

      await insertManyFavorites({
        variables: {
          data: favorites,
        },
        refetchQueries: [getOperationName(GET_FAVORITES) ?? ''],
      });
    }
  }

  const theme = useTheme();

  return (
    <RecoilScope SpecificContext={TableContext}>
      <WithTopBarContainer
        title="People"
        icon={<IconUser size={theme.icon.size.sm} />}
        onAddButtonClick={handleAddButtonClick}
        onFavouriteButtonClick={handleAddFavorite}
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
