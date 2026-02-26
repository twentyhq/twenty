import { useCallback } from 'react';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  actionMenuConfirmationModalState,
  type ActionMenuConfirmationModalConfig,
} from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ACTION_MENU_CONFIRMATION_MODAL_ID =
  'action-menu-confirmation-modal';

export const useActionMenuConfirmationModal = () => {
  const setActionMenuConfirmationModalState = useSetAtomState(
    actionMenuConfirmationModalState,
  );
  const { openModal, closeModal } = useModal();

  const openConfirmationModal = useCallback(
    (actionMenuConfirmationModalConfig: ActionMenuConfirmationModalConfig) => {
      setActionMenuConfirmationModalState(actionMenuConfirmationModalConfig);
      openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    },
    [setActionMenuConfirmationModalState, openModal],
  );

  const closeConfirmationModal = useCallback(() => {
    closeModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    setActionMenuConfirmationModalState(null);
  }, [closeModal, setActionMenuConfirmationModalState]);

  return { openConfirmationModal, closeConfirmationModal };
};
