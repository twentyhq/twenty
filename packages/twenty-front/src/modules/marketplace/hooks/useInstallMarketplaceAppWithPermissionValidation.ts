import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useCallback } from 'react';

const INSTALL_PERMISSION_VALIDATION_MODAL_ID =
  'install-permission-validation-modal';

type UseInstallMarketplaceAppWithPermissionValidationArgs = Parameters<
  typeof useInstallMarketplaceApp
>[0];

export const useInstallMarketplaceAppWithPermissionValidation = (
  args?: UseInstallMarketplaceAppWithPermissionValidationArgs,
) => {
  const { openDialog } = useDialog();
  const { install, isInstalling } = useInstallMarketplaceApp(args);

  const requestInstall = useCallback(() => {
    openDialog(INSTALL_PERMISSION_VALIDATION_MODAL_ID);
  }, [openDialog]);

  return {
    requestInstall,
    install,
    isInstalling,
    modalInstanceId: INSTALL_PERMISSION_VALIDATION_MODAL_ID,
  };
};
