import { useAtomValue } from 'jotai';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { CONFIRMATION_MODAL_MANAGER_ID } from '@/ui/layout/modal/hooks/useConfirmationModalManager';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { confirmationModalManagerState } from '@/ui/layout/modal/states/confirmationModalManagerState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const isModalOpenedAtom = isModalOpenedComponentState.atomFamily({
  instanceId: CONFIRMATION_MODAL_MANAGER_ID,
});

export const ConfirmationModalManager = () => {
  const config = useAtomValue(confirmationModalManagerState.atom);
  const isOpen = useAtomValue(isModalOpenedAtom);
  const setConfig = useSetAtomState(confirmationModalManagerState);

  const handleConfirmClick = async () => {
    try {
      await config?.onConfirmClick();
    } finally {
      setConfig(null);
    }
  };

  const handleClose = () => {
    setConfig(null);
  };

  if (!config || !isOpen) {
    return null;
  }

  return (
    <ConfirmationModal
      modalId={CONFIRMATION_MODAL_MANAGER_ID}
      title={config.title}
      subtitle={config.subtitle}
      onConfirmClick={handleConfirmClick}
      onClose={handleClose}
      confirmButtonText={config.confirmButtonText}
      confirmButtonAccent={config.confirmButtonAccent}
    />
  );
};
