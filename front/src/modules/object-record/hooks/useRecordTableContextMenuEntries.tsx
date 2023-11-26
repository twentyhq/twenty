import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';
import { IconHeart, IconHeartOff, IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { selectedRowIdsSelector } from '@/ui/object/record-table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';

// TODO: refactor this
export const useRecordTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);

  const setTableRowIds = useSetRecoilState(tableRowIdsState);
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const { scopeId: objectNamePlural, resetTableRowSelection } =
    useRecordTable();

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNamePlural,
    },
  );

  const { createFavorite, deleteFavorite, favorites } = useFavorites({
    objectNamePlural,
  });

  const handleFavoriteButtonClick = useRecoilCallback(({ snapshot }) => () => {
    const selectedRowIds = snapshot
      .getLoadable(selectedRowIdsSelector)
      .getValue();

    const selectedRowId = selectedRowIds.length === 1 ? selectedRowIds[0] : '';

    const isFavorite =
      !!selectedRowId &&
      !!favorites?.find((favorite) => favorite.recordId === selectedRowId);

    resetTableRowSelection();

    if (isFavorite) {
      deleteFavorite(selectedRowId);
    } else {
      createFavorite(selectedRowId);
    }
  });

  const { deleteOneObject } = useDeleteOneObjectRecord({
    objectNameSingular: foundObjectMetadataItem?.nameSingular,
  });

  const handleDeleteClick = useRecoilCallback(({ snapshot }) => async () => {
    const rowIdsToDelete = snapshot
      .getLoadable(selectedRowIdsSelector)
      .getValue();

    resetTableRowSelection();

    if (deleteOneObject) {
      for (const rowId of rowIdsToDelete) {
        await deleteOneObject(rowId);
      }

      setTableRowIds((tableRowIds) =>
        tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
      );
    }
  });

  return {
    setContextMenuEntries: useCallback(() => {
      const selectedRowId =
        selectedRowIds.length === 1 ? selectedRowIds[0] : '';

      const isFavorite =
        isNonEmptyString(selectedRowId) &&
        !!favorites?.find((favorite) => favorite.recordId === selectedRowId);

      const contextMenuEntries = [
        // {
        //   label: 'New task',
        //   Icon: IconCheckbox,
        //   onClick: () => {},
        // },
        // {
        //   label: 'New note',
        //   Icon: IconNotes,
        //   onClick: () => {},
        // },
        {
          label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
          Icon: isFavorite ? IconHeartOff : IconHeart,
          onClick: () => handleFavoriteButtonClick(),
        },
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => handleDeleteClick(),
        },
      ];

      if (selectedRowIds.length > 1) {
        contextMenuEntries.splice(2, 1);
      }

      setContextMenuEntries(contextMenuEntries as any);
    }, [
      selectedRowIds,
      favorites,
      handleDeleteClick,
      handleFavoriteButtonClick,
      setContextMenuEntries,
    ]),

    setActionBarEntries: useRecoilCallback(() => () => {
      setActionBarEntriesState([
        // {
        //   label: 'Task',
        //   Icon: IconCheckbox,
        //   onClick: () => {},
        // },
        // {
        //   label: 'Note',
        //   Icon: IconNotes,
        //   onClick: () => {},
        // },
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
