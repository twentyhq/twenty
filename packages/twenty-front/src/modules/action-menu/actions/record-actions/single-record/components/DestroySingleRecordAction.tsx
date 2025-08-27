import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { AppPath } from '@/types/AppPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DestroySingleRecordAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const recordId = useSelectedRecordIdOrThrow();

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleDeleteClick = async () => {
    resetTableRowSelection();

    await destroyOneRecord(recordId);
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: objectMetadataItem.namePlural,
    });
  };

  return (
    <ActionModal
      title="Permanently Destroy Record"
      subtitle="Are you sure you want to destroy this record? It cannot be recovered anymore."
      onConfirmClick={handleDeleteClick}
      confirmButtonText="Permanently Destroy Record"
      closeSidePanelOnShowPageOptionsActionExecution={true}
    />
  );
};
