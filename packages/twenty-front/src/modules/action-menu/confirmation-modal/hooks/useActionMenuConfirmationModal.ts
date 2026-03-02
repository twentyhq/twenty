import { useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import {
  type ActionMenuConfirmationModalConfig,
  actionMenuConfirmationModalState,
} from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useActionMenuConfirmationModal = () => {
  const setActionMenuConfirmationModal = useSetAtomState(
    actionMenuConfirmationModalState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (config: ActionMenuConfirmationModalConfig) => {
      setActionMenuConfirmationModal(config);

      openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    },
    [setActionMenuConfirmationModal, openModal],
  );

  return { openConfirmationModal };
};
