import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { actionMenuConfirmationModalState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ActionMenuConfirmationModalManager = () => {
  const actionMenuConfirmationModal = useAtomStateValue(
    actionMenuConfirmationModalState,
  );
  const isConfirmationModalOpen = useAtomComponentStateValue(
    isModalOpenedComponentState,
    ACTION_MENU_CONFIRMATION_MODAL_ID,
  );
  const setActionMenuConfirmationModalState = useSetAtomState(
    actionMenuConfirmationModalState,
  );

  const handleConfirmClick = async () => {
    try {
      await actionMenuConfirmationModal?.onConfirmClick();
    } finally {
      setActionMenuConfirmationModalState(null);
    }
  };

  const handleClose = () => {
    setActionMenuConfirmationModalState(null);
  };

  if (!actionMenuConfirmationModal || !isConfirmationModalOpen) {
    return null;
  }

  return (
    <ConfirmationModal
      modalId={ACTION_MENU_CONFIRMATION_MODAL_ID}
      title={actionMenuConfirmationModal.title}
      subtitle={actionMenuConfirmationModal.subtitle}
      onConfirmClick={handleConfirmClick}
      onClose={handleClose}
      confirmButtonText={actionMenuConfirmationModal.confirmButtonText}
      confirmButtonAccent={actionMenuConfirmationModal.confirmButtonAccent}
    />
  );
};
