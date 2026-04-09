import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useInstallApp = <TVariables extends Record<string, unknown>>(
  mutationFn: (options: {
    variables: TVariables;
  }) => Promise<{ data?: Record<string, unknown> | null }>,
) => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [isInstalling, setIsInstalling] = useState(false);

  const install = async (variables: TVariables) => {
    setIsInstalling(true);

    try {
      const result = await mutationFn({ variables });

      if (isDefined(result.data)) {
        enqueueSuccessSnackBar({
          message: t`Application installed successfully.`,
        });

        return true;
      }

      return false;
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to install the application.`,
      });

      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  return { install, isInstalling };
};
