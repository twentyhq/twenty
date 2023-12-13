import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useEnrichOneRecord } from '@/object-record/hooks/useEnrichOneRecord';
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

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular,
  });

  const { enrichOneRecord } = useEnrichOneRecord({
    objectNameSingular,
  });

  const handleDeleteClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToDelete = snapshot
          .getLoadable(selectedRowIdsSelector)
          .getValue();

        resetTableRowSelection();
        await Promise.all(
          rowIdsToDelete.map(async (rowId) => {
            await deleteOneRecord(rowId);
          }),
        );
      },
    [deleteOneRecord, resetTableRowSelection],
  );

  const handleEnrichClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const rowIdsToEnrich = snapshot
          .getLoadable(selectedRowIdsSelector)
          .getValue();

        resetTableRowSelection();
        await Promise.all(
          rowIdsToEnrich.map(async (rowId) => {
            await enrichOneRecord(rowId);
          }),
        );
      },
    [enrichOneRecord, resetTableRowSelection],
  );

  const dataEnrichmentEnabled = useIsFeatureEnabled(
    'IS_DATA_ENRICHMENT_ENABLED',
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
        ...(dataEnrichmentEnabled
          ? []
          : [
              {
                label: 'Enrich',
                Icon: IconWand,
                onClick: () => handleEnrichClick(),
              },
            ]),
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
