import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useCallback } from 'react';

const INSTALL_PERMISSION_VALIDATION_MODAL_ID =
  'install-permission-validation-modal';

export const useInstallMarketplaceAppWithPermissionValidation = () => {
  const { openModal } = useModal();
  const { install, isInstalling } = useInstallMarketplaceApp();

  const requestInstall = useCallback(() => {
    openModal(INSTALL_PERMISSION_VALIDATION_MODAL_ID);
  }, [openModal]);

  return {
    requestInstall,
    install,
    isInstalling,
    modalInstanceId: INSTALL_PERMISSION_VALIDATION_MODAL_ID,
  };
};
