import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useExecuteQuickActionOnOneRecord } from '@/object-record/hooks/useExecuteQuickActionOnOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { selectedRowIdsSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsSelector';
import {
  IconHeart,
  IconHeartOff,
  IconTrash,
  IconWand,
} from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

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

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const { scopeId: objectNamePlural, resetTableRowSelection } = useRecordTable({
    recordTableScopeId: scopeId,
  });

  const { objectNameSingular } = useObjectNameSingularFromPlural({
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

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular,
  });

  const { executeQuickActionOnOneRecord } = useExecuteQuickActionOnOneRecord({
    objectNameSingular,
  });

  const handleDeleteClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToDelete = snapshot
          .getLoadable(selectedRowIdsSelector)
          .getValue();

        resetTableRowSelection();
        await deleteManyRecords(rowIdsToDelete);
      },
    [deleteManyRecords, resetTableRowSelection],
  );

  const handleExecuteQuickActionOnClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToExecuteQuickActionOn = snapshot
          .getLoadable(selectedRowIdsSelector)
          .getValue();

        resetTableRowSelection();
        await Promise.all(
          rowIdsToExecuteQuickActionOn.map(async (rowId) => {
            await executeQuickActionOnOneRecord(rowId);
          }),
        );
      },
    [executeQuickActionOnOneRecord, resetTableRowSelection],
  );

  const dataExecuteQuickActionOnmentEnabled = useIsFeatureEnabled(
    'IS_QUICK_ACTIONS_ENABLED',
  );

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
        ...(dataExecuteQuickActionOnmentEnabled
          ? [
              {
                label: 'Quick Action',
                Icon: IconWand,
                onClick: () => handleExecuteQuickActionOnClick(),
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
  };
};
