import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useInstallMarketplaceAppMutation } from '~/generated-metadata/graphql';

export const useInstallMarketplaceApp = () => {
  const [installMarketplaceAppMutation] = useInstallMarketplaceAppMutation();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [isInstalling, setIsInstalling] = useState(false);

  const install = async (params: {
    universalIdentifier: string;
    version?: string;
  }) => {
    setIsInstalling(true);

    try {
      const result = await installMarketplaceAppMutation({
        variables: {
          universalIdentifier: params.universalIdentifier,
          version: params.version,
        },
      });

      if (isDefined(result.data?.installMarketplaceApp)) {
        enqueueSuccessSnackBar({
          message: t`Application installed successfully.`,
        });

        return true;
      }

      return false;
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to install the application.`,
      });

      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    install,
    isInstalling,
  };
};
