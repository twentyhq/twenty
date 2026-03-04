import { useStore } from 'jotai';
import { useCallback } from 'react';

import { ACTION_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalId';
import {
  type ActionMenuConfirmationModalConfig,
  actionMenuConfirmationModalConfigState,
} from '@/action-menu/confirmation-modal/states/actionMenuConfirmationModalState';
import { type ActionMenuConfirmationModalResult } from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isUndefined } from '@sniptt/guards';

type PendingActionMenuConfirmationModalResultCallbacks = {
  resolve: (confirmationResult: ActionMenuConfirmationModalResult) => void;
};

const pendingActionMenuConfirmationModalResultCallbacksByCallerId = new Map<
  string,
  PendingActionMenuConfirmationModalResultCallbacks
>();

const getActionMenuConfirmationModalCallerId = (
  config: ActionMenuConfirmationModalConfig,
) => {
  const callerId = config.frontComponentId ?? config.legacyCommandActionMenuId;

  if (isUndefined(callerId)) {
    throw new Error(
      'Action menu confirmation modal callerId is required in config',
    );
  }

  return callerId;
};

export const resolvePendingActionMenuConfirmationModalResult = ({
  callerId,
  confirmationResult,
}: {
  callerId: string;
  confirmationResult: ActionMenuConfirmationModalResult;
}) => {
  const callbacks =
    pendingActionMenuConfirmationModalResultCallbacksByCallerId.get(callerId);

  if (isUndefined(callbacks)) {
    return;
  }

  pendingActionMenuConfirmationModalResultCallbacksByCallerId.delete(callerId);
  callbacks.resolve(confirmationResult);
};

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

  const openConfirmationModalAndWaitForResult = useCallback(
    (config: ActionMenuConfirmationModalConfig) => {
      const callerId = getActionMenuConfirmationModalCallerId(config);

      if (
        pendingActionMenuConfirmationModalResultCallbacksByCallerId.has(
          callerId,
        )
      ) {
        throw new Error(
          'Action menu confirmation modal result already pending for this caller',
        );
      }

      const actionMenuConfirmationModalResultPromise =
        new Promise<ActionMenuConfirmationModalResult>((resolve) => {
          pendingActionMenuConfirmationModalResultCallbacksByCallerId.set(
            callerId,
            { resolve },
          );
        });

      try {
        openConfirmationModal(config);
      } catch (error) {
        pendingActionMenuConfirmationModalResultCallbacksByCallerId.delete(
          callerId,
        );

        throw error;
      }

      return actionMenuConfirmationModalResultPromise;
    },
    [openConfirmationModal],
  );

  return { openConfirmationModal, openConfirmationModalAndWaitForResult };
};
