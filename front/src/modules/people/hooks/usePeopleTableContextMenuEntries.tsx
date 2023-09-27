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
import { ActivityType, useDeleteManyPersonMutation } from '~/generated/graphql';

import { GET_PEOPLE } from '../graphql/queries/getPeople';

import { useCreateActivityForPeople } from './useCreateActivityForPeople';
import { usePersonQuery } from './usePersonQuery';

export const usePersonTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const createActivityForPeople = useCreateActivityForPeople();

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const personId = selectedRowIds.length === 1 ? selectedRowIds[0] : '';

  const { data } = usePersonQuery(personId);

  const person = data?.findUniquePerson;

  const isFavorite = !!person?.Favorite && person.Favorite.length > 0;

  const { insertPersonFavorite, deletePersonFavorite } = useFavorites();

  const handleFavoriteButtonClick = async () => {
    if (isFavorite) deletePersonFavorite(personId);
    else insertPersonFavorite(personId);
  };

  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

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
          label: 'New Task',
          Icon: IconCheckbox,
          onClick: () => createActivityForPeople(ActivityType.Task),
        },
        {
          label: 'New Note',
          Icon: IconNotes,
          onClick: () => createActivityForPeople(ActivityType.Note),
        },
        ...(!!person
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
