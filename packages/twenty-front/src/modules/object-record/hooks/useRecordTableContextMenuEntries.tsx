import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useExecuteQuickActionOnOneRecord } from '@/object-record/hooks/useExecuteQuickActionOnOneRecord';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import {
  IconCheckbox,
  IconClick,
  IconHeart,
  IconHeartOff,
  IconMail,
  IconNotes,
  IconPuzzle,
  IconTrash,
} from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type useRecordTableContextMenuEntriesProps = {
  objectNamePlural: string;
  recordTableId: string;
};

// TODO: refactor this
export const useRecordTableContextMenuEntries = (
  props: useRecordTableContextMenuEntriesProps,
) => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);

  const { selectedRowIdsSelector } = useRecordTableStates(props?.recordTableId);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: props?.recordTableId,
  });

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural: props.objectNamePlural,
  });

  const { createFavorite, favorites, deleteFavorite } = useFavorites();

  const handleFavoriteButtonClick = useRecoilCallback(({ snapshot }) => () => {
    const selectedRowIds = getSnapshotValue(snapshot, selectedRowIdsSelector);

    const selectedRowId = selectedRowIds.length === 1 ? selectedRowIds[0] : '';

    const selectedRecord = snapshot
      .getLoadable(entityFieldsFamilyState(selectedRowId))
      .getValue();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === selectedRowId,
    );

    const isFavorite = !!selectedRowId && !!foundFavorite;

    resetTableRowSelection();

    if (isFavorite) {
      deleteFavorite(foundFavorite.id);
    } else if (selectedRecord) {
      createFavorite(selectedRecord, objectNameSingular);
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
        const rowIdsToDelete = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        resetTableRowSelection();
        await deleteManyRecords(rowIdsToDelete);
      },
    [deleteManyRecords, resetTableRowSelection, selectedRowIdsSelector],
  );

  const handleExecuteQuickActionOnClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToExecuteQuickActionOn = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        resetTableRowSelection();
        await Promise.all(
          rowIdsToExecuteQuickActionOn.map(async (rowId) => {
            await executeQuickActionOnOneRecord(rowId);
          }),
        );
      },
    [
      executeQuickActionOnOneRecord,
      resetTableRowSelection,
      selectedRowIdsSelector,
    ],
  );

  const dataExecuteQuickActionOnmentEnabled = useIsFeatureEnabled(
    'IS_QUICK_ACTIONS_ENABLED',
  );

  const openCreateActivityDrawer = useOpenCreateActivityDrawerForSelectedRowIds(
    props.recordTableId,
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
        {
          label: 'Task',
          Icon: IconCheckbox,
          onClick: () => {
            openCreateActivityDrawer('Task', objectNameSingular);
          },
        },
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => {
            openCreateActivityDrawer('Note', objectNameSingular);
          },
        },
        ...(dataExecuteQuickActionOnmentEnabled
          ? [
              {
                label: 'Actions',
                Icon: IconClick,
                subActions: [
                  {
                    label: 'Enrich',
                    Icon: IconPuzzle,
                    onClick: () => handleExecuteQuickActionOnClick(),
                  },
                  {
                    label: 'Send to mailjet',
                    Icon: IconMail,
                  },
                ],
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
