import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { PauseSubscriptionFormModal } from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/PauseSubscriptionFormModal';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useContext } from 'react';

export const PauseSubscriptionAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useRecordIndexIdFromCurrentContextStore();

  const { record } = useFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
  });

  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();

  const actionConfig = useContext(ActionConfigContext);
  const { actionMenuType } = useContext(ActionMenuContext);
  const modalId = `${actionConfig?.key}-pause-modal-${actionMenuType}`;

  const isModalOpened = useRecoilComponentValueV2(
    isModalOpenedComponentState,
    modalId,
  );

  const handleClick = () => {
    if (!record) {
      return;
    }

    if (record.accessStatus === 'WITHDRAWN') {
      enqueueErrorSnackBar({
        message: 'Cannot pause a withdrawn subscription',
      });

      return;
    }

    openModal(modalId);
  };

  if (!actionConfig) {
    return null;
  }

  return (
    <>
      <ActionDisplay onClick={handleClick} />
      {isModalOpened && (
        <PauseSubscriptionFormModal
          modalId={modalId}
          recordId={recordId}
          objectNameSingular={objectMetadataItem.nameSingular}
        />
      )}
    </>
  );
};
