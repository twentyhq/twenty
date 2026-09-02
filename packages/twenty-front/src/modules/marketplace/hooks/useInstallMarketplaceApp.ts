import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { type RequestedApplication } from '@/applications/types/requestedApplication.type';
import { isApplicationOperationInProgressError } from '@/applications/utils/isApplicationOperationInProgressError';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationState,
  InstallApplicationAsyncDocument,
} from '~/generated-metadata/graphql';

export const useInstallMarketplaceApp = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installApplicationMutation] = useMutation(
    InstallApplicationAsyncDocument,
  );
  const applications = useAtomStateValue(applicationsSelector);

  const findOngoingInstall = (
    universalIdentifier: string,
  ): RequestedApplication | null => {
    const application = applications.find(
      (storedApplication) =>
        storedApplication.universalIdentifier === universalIdentifier,
    );

    if (
      !isDefined(application) ||
      application.state === ApplicationState.INSTALLED
    ) {
      return null;
    }

    return application;
  };

  const install = async (variables: {
    universalIdentifier: string;
    version?: string;
  }): Promise<RequestedApplication | null> => {
    setIsInstalling(true);

    try {
      const result = await installApplicationMutation({ variables });

      return result.data?.installApplicationAsync ?? null;
    } catch (error) {
      if (isApplicationOperationInProgressError(error)) {
        const ongoingInstall = findOngoingInstall(
          variables.universalIdentifier,
        );

        if (isDefined(ongoingInstall)) {
          return ongoingInstall;
        }
      }

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
