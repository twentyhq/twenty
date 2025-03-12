import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { getOsControlSymbol } from 'twenty-ui';

export const useDeleteSingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();

  const handleDeleteClick = useCallback(async () => {
    resetTableRowSelection();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    if (isDefined(foundFavorite)) {
      deleteFavorite(foundFavorite.id);
    }

    await deleteOneRecord(recordId);
  }, [
    deleteFavorite,
    deleteOneRecord,
    favorites,
    resetTableRowSelection,
    recordId,
  ]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const shouldBeRegistered =
    !isRemoteObject &&
    isNull(selectedRecord?.deletedAt) &&
    !hasObjectReadOnlyPermission;

  const onClick = () => {
    if (!shouldBeRegistered) {
      return;
    }

    setIsDeleteRecordsModalOpen(true);
  };

  const osControlSymbol = getOsControlSymbol();

  return {
    shouldBeRegistered,
    onClick,
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={'Delete Record'}
        subtitle={t`Are you sure you want to delete this record? It can be recovered from the Command menu (${osControlSymbol} + K).`}
        onConfirmClick={() => {
          handleDeleteClick();
        }}
        confirmButtonText={'Delete Record'}
      />
    ),
  };
};
