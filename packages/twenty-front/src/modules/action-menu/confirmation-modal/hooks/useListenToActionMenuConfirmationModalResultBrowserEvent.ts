import { ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalResultBrowserEventName';
import { type ActionMenuConfirmationModalResultBrowserEventDetail } from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';
import { useEffect } from 'react';

export const useListenToActionMenuConfirmationModalResultBrowserEvent = ({
  onActionMenuConfirmationModalResultBrowserEvent,
  frontComponentId,
}: {
  onActionMenuConfirmationModalResultBrowserEvent: (
    detail: ActionMenuConfirmationModalResultBrowserEventDetail,
  ) => void;
  frontComponentId: string | null;
}) => {
  useEffect(() => {
    if (frontComponentId === null) {
      return;
    }

    const handleActionMenuConfirmationModalResultEvent = (event: Event) => {
      const detail = (
        event as CustomEvent<ActionMenuConfirmationModalResultBrowserEventDetail>
      ).detail;

      if (detail.frontComponentId !== frontComponentId) {
        return;
      }

      onActionMenuConfirmationModalResultBrowserEvent(detail);
    };

    window.addEventListener(
      ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      handleActionMenuConfirmationModalResultEvent,
    );

    return () => {
      window.removeEventListener(
        ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handleActionMenuConfirmationModalResultEvent,
      );
    };
  }, [frontComponentId, onActionMenuConfirmationModalResultBrowserEvent]);
};
