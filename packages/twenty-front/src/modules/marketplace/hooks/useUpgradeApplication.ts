import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  FindUpgradeApplicationJobStatusDocument,
  JobState,
  TriggerUpgradeApplicationDocument,
} from '~/generated-metadata/graphql';

type UseUpgradeApplicationArgs = {
  universalIdentifier?: string;
  onCompleted?: () => void;
};

export const useUpgradeApplication = ({
  universalIdentifier,
  onCompleted,
}: UseUpgradeApplicationArgs = {}) => {
  const { enqueueToast } = useToast();
  const [triggerUpgradeApplication, { loading: isTriggeringUpgrade }] =
    useMutation(TriggerUpgradeApplicationDocument);

  const { data: jobStatusData } = useQuery(
    FindUpgradeApplicationJobStatusDocument,
    {
      variables: { universalIdentifier: universalIdentifier ?? '' },
      skip: !isDefined(universalIdentifier),
      fetchPolicy: 'network-only',
    },
  );

  const runningJobStatus = jobStatusData?.findUpgradeApplicationJobStatus;
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

  const handleUpgradeJobSettled = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (jobStatus.state === JobState.FAILED) {
        enqueueToast({
          variant: 'error',
          children: isNonEmptyString(jobStatus.failedReason)
            ? jobStatus.failedReason
            : t`Failed to upgrade the application.`,
        });
        return;
      }

      enqueueToast({
        variant: 'success',
        children: t`Application upgraded successfully.`,
      });
      onCompleted?.();
    },
    [enqueueToast, onCompleted],
  );

  const { activeJobId, activeJobProgress, trackJob } = useTrackedQueueJob({
    runningJob,
    onQueueJobSettled: handleUpgradeJobSettled,
  });

  const upgrade = async (targetVersion: string): Promise<void> => {
    if (!isDefined(universalIdentifier)) {
      return;
    }

    try {
      const { data } = await triggerUpgradeApplication({
        variables: { input: { universalIdentifier, targetVersion } },
      });

      const jobId = data?.triggerUpgradeApplication.jobId;

      if (isDefined(jobId)) {
        trackJob({ jobId, context: universalIdentifier });
      }
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueToast({
        variant: 'error',
        children: graphqlMessage ?? t`Failed to upgrade the application.`,
      });
    }
  };

  return {
    upgrade,
    isUpgrading: isTriggeringUpgrade || isDefined(activeJobId),
    upgradeProgress: activeJobProgress,
  };
};
