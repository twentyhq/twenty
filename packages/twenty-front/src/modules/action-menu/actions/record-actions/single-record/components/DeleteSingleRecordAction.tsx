import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const DeleteSingleRecordAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(true);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

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

  return (
    <ConfirmationModal
      isOpen={isDeleteRecordsModalOpen}
      setIsOpen={setIsDeleteRecordsModalOpen}
      title={'Delete Record'}
      subtitle={t`Are you sure you want to delete this record? It can be recovered from the Command menu.`}
      onConfirmClick={() => {
        handleDeleteClick();
      }}
      confirmButtonText={'Delete Record'}
    />
  );
};
