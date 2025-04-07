import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { AppPath } from '@/types/AppPath';
import { useCallback } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DestroySingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleDeleteClick = useCallback(async () => {
    resetTableRowSelection();

    await destroyOneRecord(recordId);
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: objectMetadataItem.namePlural,
    });
  }, [
    resetTableRowSelection,
    destroyOneRecord,
    recordId,
    navigateApp,
    objectMetadataItem.namePlural,
  ]);

  return (
    <ActionModal
      title="Permanently Destroy Record"
      subtitle="Are you sure you want to destroy this record? It cannot be recovered anymore."
      onConfirmClick={handleDeleteClick}
      confirmButtonText="Permanently Destroy Record"
    />
  );
};
