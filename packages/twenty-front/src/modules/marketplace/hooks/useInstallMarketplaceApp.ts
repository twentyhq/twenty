import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
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
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const install = async (variables: {
    universalIdentifier: string;
    version?: string;
  }): Promise<InstallApplicationMutation | null> => {
    setIsInstalling(true);

    try {
      const result = await installApplicationMutation({ variables });

      if (isDefined(result.data)) {
        const installedApplication = result.data.installApplication;

        // the workspace carries the applications app chips resolve their logo
        // from, so the freshly installed one has to be added to it
        setCurrentWorkspace((currentWorkspace) =>
          isDefined(currentWorkspace)
            ? {
                ...currentWorkspace,
                installedApplications: [
                  ...currentWorkspace.installedApplications.filter(
                    (application) => application.id !== installedApplication.id,
                  ),
                  installedApplication,
                ],
              }
            : currentWorkspace,
        );

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
