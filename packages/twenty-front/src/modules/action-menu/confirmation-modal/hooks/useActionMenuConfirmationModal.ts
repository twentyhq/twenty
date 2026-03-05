import { useStore } from 'jotai';
import { useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import {
  type ActionMenuConfirmationModalConfig,
  actionMenuConfirmationModalConfigState,
} from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useActionMenuConfirmationModal = () => {
  const store = useStore();
  const setActionMenuConfirmationModalConfig = useSetAtomState(
    actionMenuConfirmationModalConfigState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (config: ActionMenuConfirmationModalConfig) => {
      const existingActionMenuConfirmationModalConfig = store.get(
        actionMenuConfirmationModalConfigState.atom,
      );
      const isActionMenuConfirmationModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID,
        }),
      );

      if (
        existingActionMenuConfirmationModalConfig !== null ||
        isActionMenuConfirmationModalOpened
      ) {
        throw new Error(
          'Action menu confirmation modal is already active for another front component',
        );
      }

      setActionMenuConfirmationModalConfig(config);

      openModal(ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID);
    },
    [store, setActionMenuConfirmationModalConfig, openModal],
  );

  return { openConfirmationModal };
};
