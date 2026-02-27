import { type ReactNode, useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/actionMenuConfirmationModalId';
import { actionMenuConfirmationModalState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import {
  clearActionMenuConfirmationModalCallbacks,
  setActionMenuConfirmationModalCallbacks,
} from '@/action-menu/confirmation-modal/stores/actionMenuConfirmationModalCallbacksStore';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type OpenActionMenuConfirmationModalOptions = {
  title: string;
  subtitle: ReactNode;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  onConfirmClick: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
};

export const useActionMenuConfirmationModal = () => {
  const setActionMenuConfirmationModal = useSetAtomState(
    actionMenuConfirmationModalState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (
      openActionMenuConfirmationModalOptions: OpenActionMenuConfirmationModalOptions,
    ) => {
      clearActionMenuConfirmationModalCallbacks();

      setActionMenuConfirmationModalCallbacks({
        callbacks: {
          onConfirmClick: openActionMenuConfirmationModalOptions.onConfirmClick,
          onClose: openActionMenuConfirmationModalOptions.onClose,
        },
      });

      setActionMenuConfirmationModal({
        title: openActionMenuConfirmationModalOptions.title,
        subtitle: openActionMenuConfirmationModalOptions.subtitle,
        confirmButtonText:
          openActionMenuConfirmationModalOptions.confirmButtonText,
        confirmButtonAccent:
          openActionMenuConfirmationModalOptions.confirmButtonAccent,
      });

      openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    },
    [setActionMenuConfirmationModal, openModal],
  );

  return { openConfirmationModal };
};
