import { skipToken, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type LogConsoleAppAnalyticsTarget } from '@/log-console/types/LogConsoleAppAnalyticsTarget';
import {
  FindApplicationAnalyticsDocument,
  FindApplicationRegistrationAnalyticsDocument,
} from '~/generated-metadata/graphql';

export const useLogConsoleAppAnalytics = ({
  target,
  periodStart,
  periodEnd,
}: {
  target: LogConsoleAppAnalyticsTarget;
  periodStart: string;
  periodEnd: string;
}) => {
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
        }
      : skipToken,
  );

  const { analytics, loading, error } =
    target.scope === 'all-workspaces'
      ? {
          analytics: (
            allWorkspacesResult.data ?? allWorkspacesResult.previousData
          )?.findApplicationRegistrationAnalytics,
          loading: allWorkspacesResult.loading,
          error: allWorkspacesResult.error,
        }
      : {
          analytics: (
            currentWorkspaceResult.data ?? currentWorkspaceResult.previousData
          )?.findApplicationAnalytics,
          loading: currentWorkspaceResult.loading,
          error: currentWorkspaceResult.error,
        };

  return {
    analytics,
    isInitialLoading: loading && !isDefined(analytics),
    error,
  };
};
