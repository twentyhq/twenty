import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
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
  const { add: addToast } = useToast();
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

  const runningJobStatus = jobStatusData?.findInstallApplicationJobStatus;
  const runningJobId =
    isDefined(runningJobStatus) && !isTerminalJobState(runningJobStatus.state)
      ? runningJobStatus.jobId
      : undefined;

  const handleInstallJobSettled = useCallback(
    async (jobStatus: TrackedJobStatus, trackedUniversalIdentifier: string) => {
      if (jobStatus.state === JobState.FAILED) {
        addToast({
          variant: 'error',
          children: isNonEmptyString(jobStatus.failedReason)
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
          variables: { universalIdentifier: trackedUniversalIdentifier },
        });

        installedApplication = result.data?.findOneApplication;
      } catch {
        addToast({
          variant: 'error',
          children: t`Failed to load the application.`,
        });
        return;
      }

      if (!isDefined(installedApplication)) {
        addToast({
          variant: 'error',
          children: t`Failed to load the application.`,
        });
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

      addToast({
        variant: 'success',
        children: t`Application installed successfully.`,
      });
      onCompleted?.(installedApplication);
    },
    [addToast, findInstalledApplication, onCompleted, setCurrentWorkspace],
  );

  const { activeJobId, trackJob } = useTrackedQueueJob({
    runningJob:
      isDefined(runningJobId) && isDefined(universalIdentifier)
        ? { jobId: runningJobId, context: universalIdentifier }
        : undefined,
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

      const jobId = data?.triggerInstallApplicationJob.jobId;

      if (isDefined(jobId)) {
        trackJob({ jobId, context: universalIdentifier });
      }
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      addToast({
        variant: 'error',
        children: graphqlMessage ?? t`Failed to install the application.`,
      });
    }
  };

  return {
    install,
    isInstalling: isTriggeringInstall || isDefined(activeJobId),
  };
};
