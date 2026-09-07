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
  FindUninstallApplicationJobStatusDocument,
  JobState,
  TriggerUninstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

type UseUninstallApplicationArgs = {
  universalIdentifier?: string;
  onCompleted?: () => void;
};

export const useUninstallApplication = ({
  universalIdentifier,
  onCompleted,
}: UseUninstallApplicationArgs = {}) => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [triggerUninstallApplicationJob, { loading: isTriggeringUninstall }] =
    useMutation(TriggerUninstallApplicationJobDocument);
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const { data: jobStatusData } = useQuery(
    FindUninstallApplicationJobStatusDocument,
    {
      variables: { universalIdentifier: universalIdentifier ?? '' },
      skip: !isDefined(universalIdentifier),
      fetchPolicy: 'network-only',
    },
  );
  const [findUninstallApplicationJobStatus] = useLazyQuery(
    FindUninstallApplicationJobStatusDocument,
    { fetchPolicy: 'network-only' },
  );

  const fetchUninstallJobStatus = useCallback(
    async (jobId: string) => {
      if (!isDefined(universalIdentifier)) {
        return undefined;
      }

      const { data } = await findUninstallApplicationJobStatus({
        variables: { universalIdentifier, jobId },
      });

      return data?.findUninstallApplicationJobStatus;
    },
    [findUninstallApplicationJobStatus, universalIdentifier],
  );

  const runningJobStatus = jobStatusData?.findUninstallApplicationJobStatus;
  const runningJobId =
    isDefined(runningJobStatus) && !isTerminalJobState(runningJobStatus.state)
      ? runningJobStatus.jobId
      : undefined;

  const handleUninstallJobSettled = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (jobStatus.state === JobState.FAILED) {
        enqueueErrorSnackBar({
          message: isNonEmptyString(jobStatus.failedReason)
            ? jobStatus.failedReason
            : t`Error uninstalling application.`,
        });
        return;
      }

      setCurrentWorkspace((currentWorkspace) =>
        isDefined(currentWorkspace)
          ? {
              ...currentWorkspace,
              installedApplications:
                currentWorkspace.installedApplications.filter(
                  (application) =>
                    application.universalIdentifier !== universalIdentifier,
                ),
            }
          : currentWorkspace,
      );

      enqueueSuccessSnackBar({
        message: t`Application successfully uninstalled.`,
      });
      onCompleted?.();
    },
    [
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
      onCompleted,
      setCurrentWorkspace,
      universalIdentifier,
    ],
  );

  const { activeJobId, trackJob } = useTrackedQueueJob({
    runningJobId,
    fetchJobStatus: fetchUninstallJobStatus,
    onQueueJobSettled: handleUninstallJobSettled,
  });

  const uninstall = async (): Promise<void> => {
    if (!isDefined(universalIdentifier)) {
      return;
    }

    try {
      const { data } = await triggerUninstallApplicationJob({
        variables: { input: { universalIdentifier } },
      });

      trackJob(data?.triggerUninstallApplicationJob.jobId);
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Error uninstalling application.`,
      });
    }
  };

  return {
    uninstall,
    isUninstalling: isTriggeringUninstall || isDefined(activeJobId),
  };
};
