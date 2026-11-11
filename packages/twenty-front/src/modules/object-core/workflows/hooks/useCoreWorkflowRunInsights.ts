import { useQuery } from '@apollo/client/react';

import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { GetCoreWorkflowRunInsightsDocument } from '~/generated/graphql';

export const useCoreWorkflowRunInsights = (coreWorkflowId: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const { userTimezone } = useUserTimezone();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowRunInsightsDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowId, timeZone: userTimezone },
      fetchPolicy: 'cache-and-network',
    },
  );

  useListenToCoreWorkflowRunEvents({
    coreWorkflowIds: [coreWorkflowId],
    queryId: `core-workflow-run-insights-${coreWorkflowId}`,
    onRunsChanged: refetch,
  });

  return {
    insights: data?.coreWorkflowRunInsights ?? null,
    loading,
    error,
  };
};
