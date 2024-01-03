import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useExecuteQuickActionOnOneRecord } from '@/object-record/hooks/useExecuteQuickActionOnOneRecord';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import {
  IconCheckbox,
  IconHeart,
  IconHeartOff,
  IconNotes,
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

  const { selectedRowIdsScopeInjector } = getRecordTableScopeInjector();

  const {
    injectSelectorWithRecordTableScopeId,
    injectSelectorSnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates(scopeId);

  const selectedRowIdsSelector = injectSelectorWithRecordTableScopeId(
    selectedRowIdsScopeInjector,
  );

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const { resetTableRowSelection } = useRecordTable({
    recordTableScopeId: scopeId,
  });

  const objectNamePlural = scopeId;

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { createFavorite, favorites, deleteFavorite } = useFavorites();

  const objectMetadataType =
    objectNameSingular === 'company'
      ? 'Company'
      : objectNameSingular === 'person'
        ? 'Person'
        : 'Custom';

  const handleFavoriteButtonClick = useRecoilCallback(({ snapshot }) => () => {
    const selectedRowIds = injectSelectorSnapshotValueWithRecordTableScopeId(
      snapshot,
      selectedRowIdsScopeInjector,
    );

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
        const rowIdsToDelete =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            selectedRowIdsScopeInjector,
          );

        resetTableRowSelection();
        await deleteManyRecords(rowIdsToDelete);
      },
    [
      deleteManyRecords,
      injectSelectorSnapshotValueWithRecordTableScopeId,
      resetTableRowSelection,
      selectedRowIdsScopeInjector,
    ],
  );

  const handleExecuteQuickActionOnClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToExecuteQuickActionOn =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            selectedRowIdsScopeInjector,
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
      injectSelectorSnapshotValueWithRecordTableScopeId,
      resetTableRowSelection,
      selectedRowIdsScopeInjector,
    ],
  );

  const dataExecuteQuickActionOnmentEnabled = useIsFeatureEnabled(
    'IS_QUICK_ACTIONS_ENABLED',
  );

  const openCreateActivityDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds(scopeId);

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
            openCreateActivityDrawer('Task', objectMetadataType);
          },
        },
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => {
            openCreateActivityDrawer('Note', objectMetadataType);
          },
        },
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
