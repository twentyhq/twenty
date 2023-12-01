import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { IconHeart, IconHeartOff, IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { selectedRowIdsSelector } from '@/ui/object/record-table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordTableContextMenuEntriesProps = {
  recordTableScopeId?: string;
};

// TODO: refactor this
export const useRecordTableContextMenuEntries = (
  props?: useRecordTableContextMenuEntriesProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    props?.recordTableScopeId,
  );

  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);

  const setTableRowIds = useSetRecoilState(tableRowIdsState);
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const { scopeId: objectNamePlural, resetTableRowSelection } = useRecordTable({
    recordTableScopeId: scopeId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNamePlural,
  });

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

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem?.nameSingular,
  });

  const handleDeleteClick = useRecoilCallback(({ snapshot }) => async () => {
    const rowIdsToDelete = snapshot
      .getLoadable(selectedRowIdsSelector)
      .getValue();

    resetTableRowSelection();

    if (deleteOneRecord) {
      for (const rowId of rowIdsToDelete) {
        await deleteOneRecord(rowId);
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
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => handleDeleteClick(),
        },
      ] as ContextMenuEntry[];

      if (selectedRowIds.length === 1) {
        contextMenuEntries.unshift({
          label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
          Icon: isFavorite ? IconHeartOff : IconHeart,
          onClick: () => handleFavoriteButtonClick(),
        });
      }

      setContextMenuEntries(contextMenuEntries);
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
