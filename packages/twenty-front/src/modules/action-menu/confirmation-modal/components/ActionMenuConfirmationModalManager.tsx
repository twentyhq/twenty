import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import { actionMenuConfirmationModalConfigState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { dispatchActionMenuConfirmationModalResultBrowserEvent } from '@/action-menu/confirmation-modal/utils/dispatchActionMenuConfirmationModalResultBrowserEvent';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ActionMenuConfirmationModalManager = () => {
  const actionMenuConfirmationModalConfig = useAtomStateValue(
    actionMenuConfirmationModalConfigState,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    ACTION_MENU_CONFIRMATION_MODAL_ID,
  );
  const setActionMenuConfirmationModalConfig = useSetAtomState(
    actionMenuConfirmationModalConfigState,
  );

  const clearActionMenuConfirmationModal = () => {
    setActionMenuConfirmationModalConfig(null);
  };

  const handleConfirmClick = () => {
    if (!actionMenuConfirmationModalConfig) {
      return;
    }

    dispatchActionMenuConfirmationModalResultBrowserEvent({
      requesterId: actionMenuConfirmationModalConfig.requesterId,
      result: 'confirm',
    });

    clearActionMenuConfirmationModal();
  };

  const handleClose = () => {
    if (!actionMenuConfirmationModalConfig) {
      return;
    }

    dispatchActionMenuConfirmationModalResultBrowserEvent({
      requesterId: actionMenuConfirmationModalConfig.requesterId,
      result: 'cancel',
    });

    clearActionMenuConfirmationModal();
  };

  if (!actionMenuConfirmationModalConfig || !isModalOpened) {
    return null;
  }

  return (
    <ConfirmationModal
      modalId={ACTION_MENU_CONFIRMATION_MODAL_ID}
      title={actionMenuConfirmationModalConfig.title}
      subtitle={actionMenuConfirmationModalConfig.subtitle}
      onConfirmClick={handleConfirmClick}
      onClose={handleClose}
      confirmButtonText={actionMenuConfirmationModalConfig.confirmButtonText}
      confirmButtonAccent={
        actionMenuConfirmationModalConfig.confirmButtonAccent
      }
    />
  );
};
