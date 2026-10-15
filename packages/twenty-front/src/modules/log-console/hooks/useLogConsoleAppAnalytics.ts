import { skipToken, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type LogConsoleAppAnalyticsTarget } from '@/log-console/types/LogConsoleAppAnalyticsTarget';
import {
  FindApplicationAnalyticsDocument,
  FindApplicationRegistrationAnalyticsDocument,
} from '~/generated-metadata/graphql';

const APP_ANALYTICS_POLL_INTERVAL_MS = 30_000;

export const useLogConsoleAppAnalytics = ({
  target,
  periodStart,
  periodEnd,
  isPaused,
  isLive,
}: {
  target: LogConsoleAppAnalyticsTarget;
  periodStart: string;
  periodEnd: string;
  isPaused: boolean;
  isLive: boolean;
}) => {
  const pollInterval = isLive && !isPaused ? APP_ANALYTICS_POLL_INTERVAL_MS : 0;

  const allWorkspacesResult = useQuery(
    FindApplicationRegistrationAnalyticsDocument,
    target.scope === 'all-workspaces'
      ? {
          variables: {
            input: {
              id: target.applicationRegistrationId,
              periodStart,
              periodEnd,
            },
          },
          fetchPolicy: 'cache-and-network',
          pollInterval,
          skipPollAttempt: () => document.hidden,
        }
      : skipToken,
  );

  const currentWorkspaceResult = useQuery(
    FindApplicationAnalyticsDocument,
    target.scope === 'current-workspace'
      ? {
          variables: {
            input: {
              applicationId: target.applicationId,
              periodStart,
              periodEnd,
            },
          },
          fetchPolicy: 'cache-and-network',
          pollInterval,
          skipPollAttempt: () => document.hidden,
        }
      : skipToken,
  );

  const [wasPaused, setWasPaused] = useState(isPaused);
  const refetch =
    target.scope === 'all-workspaces'
      ? allWorkspacesResult.refetch
      : currentWorkspaceResult.refetch;

  const activeAnalytics =
    target.scope === 'all-workspaces'
      ? (allWorkspacesResult.data ?? allWorkspacesResult.previousData)
          ?.findApplicationRegistrationAnalytics
      : (currentWorkspaceResult.data ?? currentWorkspaceResult.previousData)
          ?.findApplicationAnalytics;
  const [displayedAnalytics, setDisplayedAnalytics] =
    useState<typeof activeAnalytics>();

  useEffect(() => {
    if (!isPaused || !isDefined(displayedAnalytics)) {
      setDisplayedAnalytics(activeAnalytics);
    }
  }, [activeAnalytics, displayedAnalytics, isPaused]);

  const analytics =
    isPaused && isDefined(displayedAnalytics)
      ? displayedAnalytics
      : activeAnalytics;

  useEffect(() => {
    if (wasPaused === isPaused) {
      return;
    }

    setWasPaused(isPaused);

    if (wasPaused) {
      void refetch().catch(() => {});
    }
  }, [isPaused, refetch, wasPaused]);

  const result =
    target.scope === 'all-workspaces'
      ? allWorkspacesResult
      : currentWorkspaceResult;

  return {
    analytics,
    isInitialLoading: result.loading && !isDefined(analytics),
    error: isPaused && isDefined(displayedAnalytics) ? undefined : result.error,
  };
};
