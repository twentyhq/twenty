import { useStore } from 'jotai';
import { useCallback } from 'react';

import { COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalId';
import {
  type CommandMenuItemConfirmationModalConfig,
  commandMenuItemConfirmationModalConfigState,
} from '@/command-menu-item/confirmation-modal/states/commandMenuItemConfirmationModalState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCommandMenuConfirmationModal = () => {
  const store = useStore();
  const setCommandMenuItemConfirmationModalConfig = useSetAtomState(
    commandMenuItemConfirmationModalConfigState,
  );
  const { openModal } = useModal();

  const openConfirmationModal = useCallback(
    (config: CommandMenuItemConfirmationModalConfig) => {
      const existingCommandMenuItemConfirmationModalConfig = store.get(
        commandMenuItemConfirmationModalConfigState.atom,
      );
      const isCommandMenuItemConfirmationModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID,
        }),
      );

      if (
        existingCommandMenuItemConfirmationModalConfig !== null ||
        isCommandMenuItemConfirmationModalOpened
      ) {
        throw new Error(
          'Command menu item confirmation modal is already active for another caller',
        );
      }

      setCommandMenuItemConfirmationModalConfig(config);

      openModal(COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID);
    },
    [store, setCommandMenuItemConfirmationModalConfig, openModal],
  );

  return { openConfirmationModal };
};
