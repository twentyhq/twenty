import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  FindOneApplicationByUniversalIdentifierDocument,
  type FindOneApplicationByUniversalIdentifierQuery,
  JobState,
  TriggerInstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

type UseInstallMarketplaceAppArgs = {
  onCompleted?: (
    application: FindOneApplicationByUniversalIdentifierQuery['findOneApplication'],
  ) => void;
};

export const useInstallMarketplaceApp = ({
  onCompleted,
}: UseInstallMarketplaceAppArgs = {}) => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationJobId, setInstallationJobId] = useState<string>();
  const installationUniversalIdentifier = useRef<string>();
  const hasHandledTerminalEvent = useRef(false);
  const [triggerInstallApplicationJob] = useMutation(
    TriggerInstallApplicationJobDocument,
  );
  const [findInstalledApplication] = useLazyQuery(
    FindOneApplicationByUniversalIdentifierDocument,
    { fetchPolicy: 'network-only' },
  );
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const install = async (variables: {
    universalIdentifier: string;
    version?: string;
  }): Promise<void> => {
    const jobId = v4();

    installationUniversalIdentifier.current = variables.universalIdentifier;
    hasHandledTerminalEvent.current = false;
    setInstallationJobId(jobId);
    setIsInstalling(true);

    try {
      await triggerInstallApplicationJob({
        variables: { input: { ...variables, jobId } },
      });
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to install the application.`,
      });

      setInstallationJobId(undefined);
      setIsInstalling(false);
    }
  };

  const handleQueueJobEvent = useCallback(
    async (jobStatus: { state: JobState; failedReason?: string | null }) => {
      if (
        hasHandledTerminalEvent.current ||
        ![JobState.COMPLETED, JobState.FAILED].includes(jobStatus.state)
      ) {
        return;
      }

      hasHandledTerminalEvent.current = true;
      setInstallationJobId(undefined);
      setIsInstalling(false);

      if (jobStatus.state === JobState.FAILED) {
        enqueueErrorSnackBar({
          message: isNonEmptyString(jobStatus.failedReason)
            ? jobStatus.failedReason
            : t`Failed to install the application.`,
        });
        return;
      }

      const universalIdentifier = installationUniversalIdentifier.current;

      if (!isDefined(universalIdentifier)) {
        return;
      }

      let installedApplication:
        | FindOneApplicationByUniversalIdentifierQuery['findOneApplication']
        | undefined;

      try {
        const result = await findInstalledApplication({
          variables: { universalIdentifier },
        });

        installedApplication = result.data?.findOneApplication;
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to load the application.` });
        return;
      }

      if (!isDefined(installedApplication)) {
        enqueueErrorSnackBar({ message: t`Failed to load the application.` });
        return;
      }

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
      onCompleted?.(installedApplication);
    },
    [
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
      findInstalledApplication,
      onCompleted,
      setCurrentWorkspace,
    ],
  );

  useListenToQueueJob({
    jobId: installationJobId,
    onQueueJobEvent: handleQueueJobEvent,
  });

  return { install, isInstalling };
};
