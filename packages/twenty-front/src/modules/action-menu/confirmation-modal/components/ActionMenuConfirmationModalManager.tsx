import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/actionMenuConfirmationModalId';
import { actionMenuConfirmationModalState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { consumeActionMenuConfirmationModalCallbacks } from '@/action-menu/confirmation-modal/stores/actionMenuConfirmationModalCallbacksStore';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ActionMenuConfirmationModalManager = () => {
  const actionMenuConfirmationModal = useAtomStateValue(
    actionMenuConfirmationModalState,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    ACTION_MENU_CONFIRMATION_MODAL_ID,
  );
  const setActionMenuConfirmationModal = useSetAtomState(
    actionMenuConfirmationModalState,
  );

  const clearActionMenuConfirmationModal = () => {
    setActionMenuConfirmationModal(null);
  };

  const handleConfirmClick = async () => {
    const actionMenuConfirmationModalCallbacks =
      consumeActionMenuConfirmationModalCallbacks();

    try {
      await actionMenuConfirmationModalCallbacks?.onConfirmClick();
    } finally {
      clearActionMenuConfirmationModal();
    }
  };

  const handleClose = async () => {
    const actionMenuConfirmationModalCallbacks =
      consumeActionMenuConfirmationModalCallbacks();

    try {
      await actionMenuConfirmationModalCallbacks?.onClose?.();
    } finally {
      clearActionMenuConfirmationModal();
    }
  };

  if (!actionMenuConfirmationModal || !isModalOpened) {
    return null;
  }

  return (
    <ConfirmationModal
      modalId={ACTION_MENU_CONFIRMATION_MODAL_ID}
      title={actionMenuConfirmationModal.title}
      subtitle={actionMenuConfirmationModal.subtitle}
      onConfirmClick={handleConfirmClick}
      onClose={() => {
        void handleClose();
      }}
      confirmButtonText={actionMenuConfirmationModal.confirmButtonText}
      confirmButtonAccent={actionMenuConfirmationModal.confirmButtonAccent}
    />
  );
};
