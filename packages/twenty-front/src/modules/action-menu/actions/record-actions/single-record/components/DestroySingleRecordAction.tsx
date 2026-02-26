import { useActionMenuConfirmationModal } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DestroySingleRecordAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const recordId = useSelectedRecordIdOrThrow();

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { openConfirmationModal } = useActionMenuConfirmationModal();
  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution: true,
  });

  const handleDeleteClick = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    await destroyOneRecord(recordId);
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: objectMetadataItem.namePlural,
    });
  };

  const handleClick = () => {
    openConfirmationModal({
      title: t`Permanently Destroy Record`,
      subtitle: t`Are you sure you want to destroy this record? It cannot be recovered anymore.`,
      onConfirmClick: async () => {
        await handleDeleteClick();
        closeActionMenu();
      },
      confirmButtonText: t`Permanently Destroy Record`,
      confirmButtonAccent: 'danger',
    });
  };

  return <ActionDisplay onClick={handleClick} />;
};
