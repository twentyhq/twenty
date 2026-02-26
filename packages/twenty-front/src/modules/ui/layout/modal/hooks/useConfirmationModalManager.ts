import { useCallback } from 'react';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  confirmationModalManagerState,
  type ConfirmationModalManagerConfig,
} from '@/ui/layout/modal/states/confirmationModalManagerState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const CONFIRMATION_MODAL_MANAGER_ID = 'confirmation-modal-manager';

export const useConfirmationModalManager = () => {
  const setConfig = useSetAtomState(confirmationModalManagerState);
  const { openModal, closeModal } = useModal();

  const openConfirmationModal = useCallback(
    (config: ConfirmationModalManagerConfig) => {
      setConfig(config);
      openModal(CONFIRMATION_MODAL_MANAGER_ID);
    },
    [setConfig, openModal],
  );

  const closeConfirmationModal = useCallback(() => {
    closeModal(CONFIRMATION_MODAL_MANAGER_ID);
    setConfig(null);
  }, [closeModal, setConfig]);

  return { openConfirmationModal, closeConfirmationModal };
};
