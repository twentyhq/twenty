import { useQuery } from '@apollo/client/react';

import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getCoreObjectRunInsightsHasRuns } from '@/object-core/utils/getCoreObjectRunInsightsHasRuns';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { GetCoreWorkflowRunInsightsDocument } from '~/generated/graphql';

export const useCoreWorkflowRunInsights = ({
  coreWorkflowId,
  shouldSkip,
}: {
  coreWorkflowId: string;
  shouldSkip: boolean;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const { userTimezone } = useUserTimezone();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowRunInsightsDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowId, timeZone: userTimezone },
      fetchPolicy: 'cache-and-network',
      skip: shouldSkip,
    },
  );

  useListenToCoreWorkflowRunEvents({
    coreWorkflowIds: shouldSkip ? [] : [coreWorkflowId],
    queryId: `core-workflow-run-insights-${coreWorkflowId}`,
    onRunsChanged: () => {
      if (!shouldSkip) {
        void refetch();
      }
    },
  });

  return {
    insights: data?.coreWorkflowRunInsights ?? null,
    hasRuns: getCoreObjectRunInsightsHasRuns({
      isLoading: loading,
      runCount: data?.coreWorkflowRunInsights?.runCount,
    }),
    loading,
    error,
  };
};
