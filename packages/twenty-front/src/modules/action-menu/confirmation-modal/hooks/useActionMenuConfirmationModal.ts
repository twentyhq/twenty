import { type ReactNode, useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/actionMenuConfirmationModalId';
import { ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/action-menu/confirmation-modal/constants/actionMenuConfirmationModalResultBrowserEventName';
import { actionMenuConfirmationModalState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import {
  type ActionMenuConfirmationModalResult,
  type ActionMenuConfirmationModalResultBrowserEventDetail,
} from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type OpenActionMenuConfirmationModalOptions = {
  frontComponentId: string;
  title: string;
  subtitle: ReactNode;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
};

export const useActionMenuConfirmationModal = () => {
  const setActionMenuConfirmationModal = useSetAtomState(
    actionMenuConfirmationModalState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (
      options: OpenActionMenuConfirmationModalOptions,
    ): Promise<ActionMenuConfirmationModalResult> => {
      return new Promise((resolve) => {
        const handleResult = (event: Event) => {
          const detail = (
            event as CustomEvent<ActionMenuConfirmationModalResultBrowserEventDetail>
          ).detail;

          if (detail.frontComponentId !== options.frontComponentId) {
            return;
          }

          window.removeEventListener(
            ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
            handleResult,
          );

          resolve(detail.result);
        };

        window.addEventListener(
          ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
          handleResult,
        );

        setActionMenuConfirmationModal({
          frontComponentId: options.frontComponentId,
          title: options.title,
          subtitle: options.subtitle,
          confirmButtonText: options.confirmButtonText,
          confirmButtonAccent: options.confirmButtonAccent,
        });

        openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
      });
    },
    [setActionMenuConfirmationModal, openModal],
  );

  return { openConfirmationModal };
};
