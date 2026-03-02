import { type ReactNode, useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import { actionMenuConfirmationModalState } from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
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
    (options: OpenActionMenuConfirmationModalOptions) => {
      setActionMenuConfirmationModal({
        frontComponentId: options.frontComponentId,
        title: options.title,
        subtitle: options.subtitle,
        confirmButtonText: options.confirmButtonText,
        confirmButtonAccent: options.confirmButtonAccent,
      });

      openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    },
    [setActionMenuConfirmationModal, openModal],
  );

  return { openConfirmationModal };
};
