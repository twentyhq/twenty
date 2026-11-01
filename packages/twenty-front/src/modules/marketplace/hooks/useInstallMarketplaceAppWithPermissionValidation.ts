import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { getApplicationInstallPath } from '@/settings/applications/grant/utils/getApplicationInstallPath';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type UseInstallMarketplaceAppWithPermissionValidationArgs = Parameters<
  typeof useInstallMarketplaceApp
>[0];

// Installing goes through the install page, where the admin reviews and may customize the grant
export const useInstallMarketplaceAppWithPermissionValidation = (
  args?: UseInstallMarketplaceAppWithPermissionValidationArgs,
) => {
  const navigate = useNavigate();
  const { isInstalling, installProgress } = useInstallMarketplaceApp(args);
  const universalIdentifier = args?.universalIdentifier;

  const requestInstall = useCallback(() => {
    if (isDefined(universalIdentifier)) {
      navigate(getApplicationInstallPath(universalIdentifier));
    }
  }, [navigate, universalIdentifier]);

  return { requestInstall, isInstalling, installProgress };
};
