import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import {
  IconCheckbox,
  IconHeart,
  IconHeartOff,
  IconNotes,
  IconTrash,
} from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import {
  ActivityType,
  useDeleteManyPersonMutation,
  useGetFavoritesQuery,
} from '~/generated/graphql';

import { GET_PEOPLE } from '../graphql/queries/getPeople';

import { useCreateActivityForPeople } from './useCreateActivityForPeople';

export const usePersonTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const createActivityForPeople = useCreateActivityForPeople();

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

  const selectedPersonId = selectedRowIds.length === 1 ? selectedRowIds[0] : '';

  const { data } = useGetFavoritesQuery();

  const favorites = data?.findFavorites;

  const isFavorite =
    !!selectedPersonId &&
    !!favorites?.find((favorite) => favorite.person?.id === selectedPersonId);

  const { insertPersonFavorite, deletePersonFavorite } = useFavorites();

  const handleFavoriteButtonClick = () => {
    resetRowSelection();
    if (isFavorite) deletePersonFavorite(selectedPersonId);
    else insertPersonFavorite(selectedPersonId);
  };

  const [deleteManyPerson] = useDeleteManyPersonMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

  const handleDeleteClick = async () => {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deleteManyPerson({
      variables: {
        ids: rowIdsToDelete,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyPerson: {
          count: rowIdsToDelete.length,
        },
      },
      update: () => {
        setTableRowIds(
          tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
        );
      },
    });
  };

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        {
          label: 'New task',
          Icon: IconCheckbox,
          onClick: () => createActivityForPeople(ActivityType.Task),
        },
        {
          label: 'New note',
          Icon: IconNotes,
          onClick: () => createActivityForPeople(ActivityType.Note),
        },
        ...(!!selectedPersonId
          ? [
              {
                label: isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites',
                Icon: isFavorite ? IconHeartOff : IconHeart,
                onClick: () => handleFavoriteButtonClick(),
              },
            ]
          : []),
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => handleDeleteClick(),
        },
      ]),
  };
};
