import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindInstallApplicationJobStatusDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  type FindOneApplicationByUniversalIdentifierQuery,
  JobState,
  TriggerInstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

type UseInstallMarketplaceAppArgs = {
  universalIdentifier?: string;
  onCompleted?: (
    application: FindOneApplicationByUniversalIdentifierQuery['findOneApplication'],
  ) => void;
};

export const useInstallMarketplaceApp = ({
  universalIdentifier,
  onCompleted,
}: UseInstallMarketplaceAppArgs = {}) => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [triggerInstallApplicationJob, { loading: isTriggeringInstall }] =
    useMutation(TriggerInstallApplicationJobDocument);
  const [findInstalledApplication] = useLazyQuery(
    FindOneApplicationByUniversalIdentifierDocument,
    { fetchPolicy: 'network-only' },
  );
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const { data: jobStatusData } = useQuery(
    FindInstallApplicationJobStatusDocument,
    {
      variables: { universalIdentifier: universalIdentifier ?? '' },
      skip: !isDefined(universalIdentifier),
      fetchPolicy: 'network-only',
    },
  );
  const [findInstallApplicationJobStatus] = useLazyQuery(
    FindInstallApplicationJobStatusDocument,
    { fetchPolicy: 'network-only' },
  );

  const fetchInstallJobStatus = useCallback(
    async (jobId: string) => {
      if (!isDefined(universalIdentifier)) {
        return undefined;
      }

      const { data } = await findInstallApplicationJobStatus({
        variables: { universalIdentifier, jobId },
      });

      return data?.findInstallApplicationJobStatus;
    },
    [findInstallApplicationJobStatus, universalIdentifier],
  );

  const runningJobStatus = jobStatusData?.findInstallApplicationJobStatus;
  const runningJobId =
    isDefined(runningJobStatus) && !isTerminalJobState(runningJobStatus.state)
      ? runningJobStatus.jobId
      : undefined;

  const handleInstallJobSettled = useCallback(
    async (jobStatus: TrackedJobStatus) => {
      if (!isDefined(universalIdentifier)) {
        return;
      }

      if (jobStatus.state === JobState.FAILED) {
        enqueueErrorSnackBar({
          message: isNonEmptyString(jobStatus.failedReason)
            ? jobStatus.failedReason
            : t`Failed to install the application.`,
        });
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
      universalIdentifier,
    ],
  );

  const { activeJobId, trackJob } = useTrackedQueueJob({
    runningJobId,
    fetchJobStatus: fetchInstallJobStatus,
    onQueueJobSettled: handleInstallJobSettled,
  });

  const install = async (): Promise<void> => {
    if (!isDefined(universalIdentifier)) {
      return;
    }

    try {
      const { data } = await triggerInstallApplicationJob({
        variables: { input: { universalIdentifier } },
      });

      trackJob(data?.triggerInstallApplicationJob.jobId);
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to install the application.`,
      });
    }
  };

  return {
    install,
    isInstalling: isTriggeringInstall || isDefined(activeJobId),
  };
};
