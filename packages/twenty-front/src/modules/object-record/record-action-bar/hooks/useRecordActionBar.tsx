import { useCallback, useMemo } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useExecuteQuickActionOnOneRecord } from '@/object-record/hooks/useExecuteQuickActionOnOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  IconClick,
  IconHeart,
  IconHeartOff,
  IconMail,
  IconPuzzle,
  IconTrash,
} from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type useRecordActionBarProps = {
  objectMetadataItem: ObjectMetadataItem;
  selectedRecordIds: string[];
  callback?: () => void;
};

export const useRecordActionBar = ({
  objectMetadataItem,
  selectedRecordIds,
  callback,
}: useRecordActionBarProps) => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);

  const { createFavorite, favorites, deleteFavorite } = useFavorites();

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { executeQuickActionOnOneRecord } = useExecuteQuickActionOnOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleFavoriteButtonClick = useRecoilCallback(({ snapshot }) => () => {
    if (selectedRecordIds.length > 1) {
      return;
    }

    const selectedRecordId = selectedRecordIds[0];
    const selectedRecord = snapshot
      .getLoadable(recordStoreFamilyState(selectedRecordId))
      .getValue();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === selectedRecordId,
    );

    const isFavorite = !!selectedRecordId && !!foundFavorite;

    if (isFavorite) {
      deleteFavorite(foundFavorite.id);
    } else if (selectedRecord) {
      createFavorite(selectedRecord, objectMetadataItem.nameSingular);
    }
    callback?.();
  });

  const handleDeleteClick = useCallback(async () => {
    callback?.();
    await deleteManyRecords(selectedRecordIds);
  }, [callback, deleteManyRecords, selectedRecordIds]);

  const handleExecuteQuickActionOnClick = useCallback(async () => {
    callback?.();
    await Promise.all(
      selectedRecordIds.map(async (recordId) => {
        await executeQuickActionOnOneRecord(recordId);
      }),
    );
  }, [callback, executeQuickActionOnOneRecord, selectedRecordIds]);

  const baseActions: ContextMenuEntry[] = useMemo(
    () => [
      {
        label: 'Delete',
        Icon: IconTrash,
        accent: 'danger',
        onClick: () => handleDeleteClick(),
      },
    ],
    [handleDeleteClick],
  );

  const dataExecuteQuickActionOnmentEnabled = useIsFeatureEnabled(
    'IS_QUICK_ACTIONS_ENABLED',
  );

  const hasOnlyOneRecordSelected = selectedRecordIds.length === 1;

  const isFavorite =
    isNonEmptyString(selectedRecordIds[0]) &&
    !!favorites?.find((favorite) => favorite.recordId === selectedRecordIds[0]);

  return {
    setContextMenuEntries: useCallback(() => {
      setContextMenuEntries([
        ...baseActions,
        ...(isFavorite && hasOnlyOneRecordSelected
          ? [
              {
                label: 'Remove from favorites',
                Icon: IconHeartOff,
                onClick: handleFavoriteButtonClick,
              },
            ]
          : []),
        ...(!isFavorite && hasOnlyOneRecordSelected
          ? [
              {
                label: 'Add to favorites',
                Icon: IconHeart,
                onClick: handleFavoriteButtonClick,
              },
            ]
          : []),
      ]);
    }, [
      baseActions,
      handleFavoriteButtonClick,
      hasOnlyOneRecordSelected,
      isFavorite,
      setContextMenuEntries,
    ]),

    setActionBarEntries: useCallback(() => {
      setActionBarEntriesState([
        ...(dataExecuteQuickActionOnmentEnabled
          ? [
              {
                label: 'Actions',
                Icon: IconClick,
                subActions: [
                  {
                    label: 'Enrich',
                    Icon: IconPuzzle,
                    onClick: handleExecuteQuickActionOnClick,
                  },
                  {
                    label: 'Send to mailjet',
                    Icon: IconMail,
                  },
                ],
              },
            ]
          : []),
        ...baseActions,
      ]);
    }, [
      baseActions,
      dataExecuteQuickActionOnmentEnabled,
      handleExecuteQuickActionOnClick,
      setActionBarEntriesState,
    ]),
  };
};
