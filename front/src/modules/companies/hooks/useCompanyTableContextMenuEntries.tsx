import { getOperationName } from '@apollo/client/utilities';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import {
  IconCheckbox,
  IconHeart,
  IconHeartOff,
  IconNotes,
  IconTrash,
} from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { selectedRowIdsSelector } from '@/ui/object/record-table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';
import {
  ActivityType,
  useDeleteManyCompaniesMutation,
  useGetFavoritesQuery,
} from '~/generated/graphql';

import { GET_COMPANY } from '../graphql/queries/getCompany';

import { useCreateActivityForCompany } from './useCreateActivityForCompany';

export const useCompanyTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);
  const createActivityForCompany = useCreateActivityForCompany();

  const setTableRowIds = useSetRecoilState(tableRowIdsState);
  const { resetTableRowSelection } = useRecordTable({
    recordTableScopeId: 'companies',
  });

  const { data } = useGetFavoritesQuery();
  const favorites = data?.findFavorites;
  const { insertCompanyFavorite, deleteCompanyFavorite } = useFavorites();

  const handleFavoriteButtonClick = useRecoilCallback(({ snapshot }) => () => {
    const selectedRowIds = snapshot
      .getLoadable(selectedRowIdsSelector)
      .getValue();

    const selectedCompanyId =
      selectedRowIds.length === 1 ? selectedRowIds[0] : '';

    const isFavorite =
      !!selectedCompanyId &&
      !!favorites?.find(
        (favorite) => favorite.company?.id === selectedCompanyId,
      );

    resetTableRowSelection();
    if (isFavorite) deleteCompanyFavorite(selectedCompanyId);
    else insertCompanyFavorite(selectedCompanyId);
  });

  const [deleteManyCompany] = useDeleteManyCompaniesMutation({
    refetchQueries: [getOperationName(GET_COMPANY) ?? ''],
  });

  const handleDeleteClick = useRecoilCallback(({ snapshot }) => async () => {
    const rowIdsToDelete = snapshot
      .getLoadable(selectedRowIdsSelector)
      .getValue();

    resetTableRowSelection();

    await deleteManyCompany({
      variables: {
        ids: rowIdsToDelete,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyCompany: {
          count: rowIdsToDelete.length,
        },
      },
      update: () => {
        setTableRowIds((tableRowIds) =>
          tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
        );
      },
    });
  });

  return {
    setContextMenuEntries: useRecoilCallback(({ snapshot }) => () => {
      const selectedRowIds = snapshot
        .getLoadable(selectedRowIdsSelector)
        .getValue();

      const selectedCompanyId =
        selectedRowIds.length === 1 ? selectedRowIds[0] : '';

      const isFavorite =
        !!selectedCompanyId &&
        !!favorites?.find(
          (favorite) => favorite.company?.id === selectedCompanyId,
        );

      setContextMenuEntries([
        {
          label: 'New task',
          Icon: IconCheckbox,
          onClick: () => createActivityForCompany(ActivityType.Task),
        },
        {
          label: 'New note',
          Icon: IconNotes,
          onClick: () => createActivityForCompany(ActivityType.Note),
        },
        ...(!!selectedCompanyId
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
      ]);
    }),
    setActionBarEntries: useRecoilCallback(() => () => {
      setActionBarEntriesState([
        {
          label: 'Task',
          Icon: IconCheckbox,
          onClick: () => createActivityForCompany(ActivityType.Task),
        },
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => createActivityForCompany(ActivityType.Note),
        },
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => handleDeleteClick(),
        },
      ]);
    }),
  };
};
