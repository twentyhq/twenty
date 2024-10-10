import { useHandleFavoriteButton } from '@/action-menu/hooks/useHandleFavoriteButton';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteTableData } from '@/object-record/record-index/options/hooks/useDeleteTableData';
import {
  displayedExportProgress,
  useExportTableData,
} from '@/object-record/record-index/options/hooks/useExportTableData';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconFileExport,
  IconHeart,
  IconHeartOff,
  IconTrash,
  isDefined,
} from 'twenty-ui';

export const useComputeActionsBasedOnContextStore = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { handleFavoriteButtonClick } = useHandleFavoriteButton(
    contextStoreTargetedRecordIds,
    objectMetadataItem,
  );

  const baseTableDataParams = {
    delayMs: 100,
    objectNameSingular: objectMetadataItem.nameSingular,
    recordIndexId: objectMetadataItem.namePlural,
  };

  const { deleteTableData } = useDeleteTableData(baseTableDataParams);

  const handleDeleteClick = useCallback(() => {
    deleteTableData(contextStoreTargetedRecordIds);
  }, [deleteTableData, contextStoreTargetedRecordIds]);

  const { progress, download } = useExportTableData({
    ...baseTableDataParams,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const isRemoteObject = objectMetadataItem.isRemote;

  const numberOfSelectedRecords = contextStoreTargetedRecordIds.length;

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

  const hasOnlyOneRecordSelected = contextStoreTargetedRecordIds.length === 1;

  const { favorites } = useFavorites();

  const isFavorite =
    isNonEmptyString(contextStoreTargetedRecordIds[0]) &&
    !!favorites?.find(
      (favorite) => favorite.recordId === contextStoreTargetedRecordIds[0],
    );

  return {
    availableActionsInContext: [
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
    ],
  };
};
