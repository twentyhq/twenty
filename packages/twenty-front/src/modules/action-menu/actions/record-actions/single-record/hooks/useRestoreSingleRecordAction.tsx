import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useRestoreSingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isRestoreRecordModalOpen, setIsRestoreRecordModalOpen] =
    useState(false);

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const handleRestoreClick = useCallback(async () => {
    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: [recordId],
    });
  }, [restoreManyRecords, resetTableRowSelection, recordId]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const isSoftDeleteFilterActive = useRecoilComponentValueV2(
    isSoftDeleteFilterActiveComponentState,
  );

  const isShowPage =
    useRecoilComponentValueV2(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const shouldBeRegistered =
    !isRemoteObject &&
    isDefined(selectedRecord?.deletedAt) &&
    !hasObjectReadOnlyPermission &&
    (isShowPage || isSoftDeleteFilterActive);

  const onClick = () => {
    if (!shouldBeRegistered) {
      return;
    }

    setIsRestoreRecordModalOpen(true);
  };

  const handleConfirmClick = () => {
    handleRestoreClick();
  };

  return {
    shouldBeRegistered,
    onClick,
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={isRestoreRecordModalOpen}
        setIsOpen={setIsRestoreRecordModalOpen}
        title={'Restore Record'}
        subtitle={'Are you sure you want to restore this record?'}
        onConfirmClick={handleConfirmClick}
        confirmButtonText={'Restore Record'}
      />
    ),
  };
};
