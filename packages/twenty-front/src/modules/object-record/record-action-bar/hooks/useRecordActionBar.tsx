import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { IconFileExport, IconHeart, IconHeartOff, IconTrash } from 'twenty-ui';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteTableData } from '@/object-record/record-index/options/hooks/useDeleteTableData';
import {
  displayedExportProgress,
  useExportTableData,
} from '@/object-record/record-index/options/hooks/useExportTableData';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { isDefined } from '~/utils/isDefined';

type useRecordActionBarProps = {
  objectMetadataItem: ObjectMetadataItem;
  selectedRecordIds: string[];
  callback?: () => void;
  totalNumberOfRecordsSelected?: number;
};

export const useRecordActionBar = ({
  objectMetadataItem,
  selectedRecordIds,
  callback,
  totalNumberOfRecordsSelected,
}: useRecordActionBarProps) => {
  const setActionMenuEntries = useSetRecoilState(actionMenuEntriesState);
  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { createFavorite, favorites, deleteFavorite } = useFavorites();

  const handleFavoriteButtonClick = useRecoilCallback(
    ({ snapshot }) =>
      () => {
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
        } else if (isDefined(selectedRecord)) {
          createFavorite(selectedRecord, objectMetadataItem.nameSingular);
        }
        callback?.();
      },
    [
      callback,
      createFavorite,
      deleteFavorite,
      favorites,
      objectMetadataItem.nameSingular,
      selectedRecordIds,
    ],
  );

  const baseTableDataParams = {
    delayMs: 100,
    objectNameSingular: objectMetadataItem.nameSingular,
    recordIndexId: objectMetadataItem.namePlural,
  };

  const { deleteTableData } = useDeleteTableData(baseTableDataParams);

  const handleDeleteClick = useCallback(() => {
    deleteTableData(selectedRecordIds);
  }, [deleteTableData, selectedRecordIds]);

  const { progress, download } = useExportTableData({
    ...baseTableDataParams,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const isRemoteObject = objectMetadataItem.isRemote;

  const numberOfSelectedRecords =
    totalNumberOfRecordsSelected ?? selectedRecordIds.length;
  const canDelete =
    !isRemoteObject && numberOfSelectedRecords < DELETE_MAX_COUNT;

  const menuActions: ActionMenuEntry[] = useMemo(
    () =>
      [
        {
          label: displayedExportProgress(progress),
          Icon: IconFileExport,
          accent: 'default',
          onClick: () => download(),
        } satisfies ActionMenuEntry,
        canDelete
          ? ({
              label: 'Delete',
              Icon: IconTrash,
              accent: 'danger',
              onClick: () => {
                setIsDeleteRecordsModalOpen(true);
              },
              ConfirmationModal: (
                <ConfirmationModal
                  isOpen={isDeleteRecordsModalOpen}
                  setIsOpen={setIsDeleteRecordsModalOpen}
                  title={`Delete ${numberOfSelectedRecords} ${
                    numberOfSelectedRecords === 1 ? `record` : 'records'
                  }`}
                  subtitle={`Are you sure you want to delete ${
                    numberOfSelectedRecords === 1
                      ? 'this record'
                      : 'these records'
                  }? ${
                    numberOfSelectedRecords === 1 ? 'It' : 'They'
                  } can be recovered from the Options menu.`}
                  onConfirmClick={() => handleDeleteClick()}
                  deleteButtonText={`Delete ${
                    numberOfSelectedRecords > 1 ? 'Records' : 'Record'
                  }`}
                />
              ),
            } satisfies ActionMenuEntry)
          : undefined,
      ].filter(isDefined),
    [
      download,
      progress,
      canDelete,
      handleDeleteClick,
      isDeleteRecordsModalOpen,
      numberOfSelectedRecords,
    ],
  );

  const hasOnlyOneRecordSelected = selectedRecordIds.length === 1;

  const isFavorite =
    isNonEmptyString(selectedRecordIds[0]) &&
    !!favorites?.find((favorite) => favorite.recordId === selectedRecordIds[0]);

  return {
    setActionMenuEntries: useCallback(() => {
      setActionMenuEntries([
        ...menuActions,
        ...(!isRemoteObject && isFavorite && hasOnlyOneRecordSelected
          ? [
              {
                label: 'Remove from favorites',
                Icon: IconHeartOff,
                onClick: handleFavoriteButtonClick,
              },
            ]
          : []),
        ...(!isRemoteObject && !isFavorite && hasOnlyOneRecordSelected
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
      menuActions,
      handleFavoriteButtonClick,
      hasOnlyOneRecordSelected,
      isFavorite,
      isRemoteObject,
      setActionMenuEntries,
    ]),
  };
};
