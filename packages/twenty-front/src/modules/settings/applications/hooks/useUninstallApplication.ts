import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  FindUninstallApplicationJobStatusDocument,
  JobState,
  TriggerUninstallApplicationDocument,
} from '~/generated-metadata/graphql';

type UseUninstallApplicationArgs = {
  universalIdentifier?: string;
  onCompleted?: () => void;
};

export const useUninstallApplication = ({
  universalIdentifier,
  onCompleted,
}: UseUninstallApplicationArgs = {}) => {
  const { enqueueToast } = useToast();
  const [triggerUninstallApplication, { loading: isTriggeringUninstall }] =
    useMutation(TriggerUninstallApplicationDocument);
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const { data: jobStatusData } = useQuery(
    FindUninstallApplicationJobStatusDocument,
    {
      variables: { universalIdentifier: universalIdentifier ?? '' },
      skip: !isDefined(universalIdentifier),
      fetchPolicy: 'network-only',
    },
  );

  const runningJobStatus = jobStatusData?.findUninstallApplicationJobStatus;
  const runningJob =
    isDefined(runningJobStatus) &&
    !isTerminalJobState(runningJobStatus.state) &&
    isDefined(universalIdentifier)
      ? {
          jobId: runningJobStatus.jobId,
          context: universalIdentifier,
          progress: runningJobStatus.progress ?? undefined,
        }
      : undefined;

  const handleUninstallJobSettled = useCallback(
    (jobStatus: TrackedJobStatus, trackedUninstallIdentifier: string) => {
      if (jobStatus.state === JobState.FAILED) {
        enqueueToast({
          variant: 'error',
          children: isNonEmptyString(jobStatus.failedReason)
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
                    application.universalIdentifier !==
                    trackedUninstallIdentifier,
                ),
            }
          : currentWorkspace,
      );

      enqueueToast({
        variant: 'success',
        children: t`Application successfully uninstalled.`,
      });
      onCompleted?.();
    },
    [enqueueToast, onCompleted, setCurrentWorkspace],
  );

  const { activeJobId, activeJobProgress, trackJob } = useTrackedQueueJob({
    runningJob,
    onQueueJobSettled: handleUninstallJobSettled,
  });

  const uninstall = async (): Promise<void> => {
    if (!isDefined(universalIdentifier)) {
      return;
    }

    try {
      const { data } = await triggerUninstallApplication({
        variables: { input: { universalIdentifier } },
      });

      const jobId = data?.triggerUninstallApplication.jobId;

      if (isDefined(jobId)) {
        trackJob({ jobId, context: universalIdentifier });
      }
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueToast({
        variant: 'error',
        children: graphqlMessage ?? t`Error uninstalling application.`,
      });
    }
  };

  return {
    uninstall,
    isUninstalling: isTriggeringUninstall || isDefined(activeJobId),
    uninstallProgress: activeJobProgress,
  };
};
