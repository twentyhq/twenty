import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { AppPath } from '@/types/AppPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useCallback, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useDestroySingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isDestroyRecordsModalOpen, setIsDestroyRecordsModalOpen] =
    useState(false);

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const { closeRightDrawer } = useRightDrawer();

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

  const isRemoteObject = objectMetadataItem.isRemote;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const shouldBeRegistered =
    !hasObjectReadOnlyPermission &&
    !isRemoteObject &&
    isDefined(selectedRecord?.deletedAt);

  const onClick = () => {
    if (!shouldBeRegistered) {
      return;
    }

    setIsDestroyRecordsModalOpen(true);
  };

  return {
    shouldBeRegistered,
    onClick,
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={isDestroyRecordsModalOpen}
        setIsOpen={setIsDestroyRecordsModalOpen}
        title={'Permanently Destroy Record'}
        subtitle={
          'Are you sure you want to destroy this record? It cannot be recovered anymore.'
        }
        onConfirmClick={async () => {
          await handleDeleteClick();
          if (isInRightDrawer) {
            closeRightDrawer();
          }
        }}
        deleteButtonText={'Permanently Destroy Record'}
      />
    ),
  };
};
