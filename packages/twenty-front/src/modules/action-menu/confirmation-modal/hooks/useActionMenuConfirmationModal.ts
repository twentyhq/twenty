import { useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import {
  type ActionMenuConfirmationModalConfig,
  actionMenuConfirmationModalConfigState,
} from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useActionMenuConfirmationModal = () => {
  const setActionMenuConfirmationModalConfig = useSetAtomState(
    actionMenuConfirmationModalConfigState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (config: ActionMenuConfirmationModalConfig) => {
      setActionMenuConfirmationModalConfig(config);

      openModal(ACTION_MENU_CONFIRMATION_MODAL_ID);
    },
    [setActionMenuConfirmationModalConfig, openModal],
  );

  return { openConfirmationModal };
};
