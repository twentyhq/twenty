import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteTableData } from '@/object-record/record-index/options/hooks/useDeleteTableData';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash } from 'twenty-ui';

export const DeleteRecordsActionEffect = () => {
  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
  );

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { deleteTableData } = useDeleteTableData({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordIndexId: objectMetadataItem?.namePlural ?? '',
  });

  const handleDeleteClick = useCallback(() => {
    deleteTableData(contextStoreTargetedRecordIds);
  }, [deleteTableData, contextStoreTargetedRecordIds]);

  const isRemoteObject = objectMetadataItem?.isRemote ?? false;

  const numberOfSelectedRecords = contextStoreTargetedRecordIds.length;

  const canDelete =
    !isRemoteObject && numberOfSelectedRecords < DELETE_MAX_COUNT;

  useEffect(() => {
    if (canDelete) {
      setActionMenuEntries((prevEntries) => {
        return new Map([
          ...prevEntries,
          [
            'delete',
            {
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
            },
          ],
        ]);
      });
    } else {
      setActionMenuEntries((currentActionMenuEntries) => {
        const newMap = new Map(currentActionMenuEntries);
        newMap.delete('manage-favorites');
        return newMap;
      });
    }

    return () => {
      setActionMenuEntries((currentActionMenuEntries) => {
        const newMap = new Map(currentActionMenuEntries);
        newMap.delete('delete');
        return newMap;
      });
    };
  }, [
    canDelete,
    handleDeleteClick,
    isDeleteRecordsModalOpen,
    numberOfSelectedRecords,
    setActionMenuEntries,
  ]);

  return <></>;
};
