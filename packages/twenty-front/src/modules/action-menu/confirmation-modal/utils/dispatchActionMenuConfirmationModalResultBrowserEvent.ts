import { ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalResultBrowserEventName';
import { type ActionMenuConfirmationModalResultBrowserEventDetail } from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';

export const dispatchActionMenuConfirmationModalResultBrowserEvent = (
  detail: ActionMenuConfirmationModalResultBrowserEventDetail,
) => {
  window.dispatchEvent(
    new CustomEvent<ActionMenuConfirmationModalResultBrowserEventDetail>(
      ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      { detail },
    ),
  );
};
