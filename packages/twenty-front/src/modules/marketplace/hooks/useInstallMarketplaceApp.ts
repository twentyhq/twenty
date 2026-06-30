import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  InstallApplicationDocument,
  type InstallApplicationMutation,
} from '~/generated-metadata/graphql';

export const useInstallMarketplaceApp = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installApplicationMutation] = useMutation(InstallApplicationDocument);

  const install = async (variables: {
    universalIdentifier: string;
    version?: string;
  }): Promise<InstallApplicationMutation | null> => {
    setIsInstalling(true);

    try {
      const result = await installApplicationMutation({ variables });

      if (isDefined(result.data)) {
        enqueueSuccessSnackBar({
          message: t`Application installed successfully.`,
        });

        return result.data;
      }

      return null;
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to install the application.`,
      });

      return null;
    } finally {
      setIsInstalling(false);
    }
  };

  return { install, isInstalling };
};
