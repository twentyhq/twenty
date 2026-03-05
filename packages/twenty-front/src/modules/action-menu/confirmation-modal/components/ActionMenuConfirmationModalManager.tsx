import { ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalResultBrowserEventName';
import { ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import { actionMenuConfirmationModalConfigState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import {
  type ActionMenuConfirmationModalResult,
  type ActionMenuConfirmationModalResultBrowserEventDetail,
} from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';
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
    ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID,
  );
  const setActionMenuConfirmationModalConfig = useSetAtomState(
    actionMenuConfirmationModalConfigState,
  );

  const callerId = actionMenuConfirmationModalConfig?.frontComponentId;

  const emitConfirmationResult = (
    confirmationResult: ActionMenuConfirmationModalResult,
  ) => {
    if (!callerId) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent<ActionMenuConfirmationModalResultBrowserEventDetail>(
        ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        {
          detail: {
            frontComponentId: callerId,
            confirmationResult,
          },
        },
      ),
    );

    setActionMenuConfirmationModalConfig(null);
  };

  if (!actionMenuConfirmationModalConfig || !isModalOpened) {
    return null;
  }

  return (
    <ConfirmationModal
      modalInstanceId={ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID}
      title={actionMenuConfirmationModalConfig.title}
      subtitle={actionMenuConfirmationModalConfig.subtitle}
      onConfirmClick={() => emitConfirmationResult('confirm')}
      onClose={() => emitConfirmationResult('cancel')}
      confirmButtonText={actionMenuConfirmationModalConfig.confirmButtonText}
      confirmButtonAccent={
        actionMenuConfirmationModalConfig.confirmButtonAccent
      }
    />
  );
};
