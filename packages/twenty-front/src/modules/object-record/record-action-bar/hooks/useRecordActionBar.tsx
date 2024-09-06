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
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
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
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);
  const setActionBarEntriesState = useSetRecoilState(actionBarEntriesState);
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

  const menuActions: ContextMenuEntry[] = useMemo(
    () =>
      [
        {
          label: displayedExportProgress(progress),
          Icon: IconFileExport,
          accent: 'default',
          onClick: () => download(),
        } satisfies ContextMenuEntry,
        canDelete
          ? ({
              label: 'Excluir',
              Icon: IconTrash,
              accent: 'danger',
              onClick: () => {
                setIsDeleteRecordsModalOpen(true);
              },
              ConfirmationModal: (
                <ConfirmationModal
                  isOpen={isDeleteRecordsModalOpen}
                  setIsOpen={setIsDeleteRecordsModalOpen}
                  title={`Excluir ${numberOfSelectedRecords} ${
                    numberOfSelectedRecords === 1 ? `registro` : 'registros'
                  }`}
                  subtitle={`Tem certeza de que deseja excluir ${
                    numberOfSelectedRecords === 1
                      ? 'este registro'
                      : 'estes registros'
                  }? ${
                    numberOfSelectedRecords === 1 ? 'Ele' : 'Eles'
                  } podem ser recuperados no menu de Opções.`}
                  onConfirmClick={() => handleDeleteClick()}
                  deleteButtonText={`Excluir ${
                    numberOfSelectedRecords > 1 ? 'Registros' : 'Registro'
                  }`}
                />
              ),
            } satisfies ContextMenuEntry)
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
    setContextMenuEntries: useCallback(() => {
      setContextMenuEntries([
        ...menuActions,
        ...(!isRemoteObject && isFavorite && hasOnlyOneRecordSelected
          ? [
              {
                label: 'Remover dos favoritos',
                Icon: IconHeartOff,
                onClick: handleFavoriteButtonClick,
              },
            ]
          : []),
        ...(!isRemoteObject && !isFavorite && hasOnlyOneRecordSelected
          ? [
              {
                label: 'Adicionar aos favoritos',
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
      setContextMenuEntries,
    ]),

    setActionBarEntries: useCallback(() => {
      setActionBarEntriesState([
        /*
              {
                label: 'Actions',
                Icon: IconClick,
                subActions: 
                
                /* [
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
          */
        ...menuActions,
      ]);
    }, [menuActions, setActionBarEntriesState]),
  };
};
