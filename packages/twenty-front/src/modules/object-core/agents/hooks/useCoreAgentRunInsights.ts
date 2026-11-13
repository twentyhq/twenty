import { useQuery } from '@apollo/client/react';

import { useCanReadCoreAgentRuns } from '@/object-core/agents/hooks/useCanReadCoreAgentRuns';
import { useListenToCoreAgentRunEvents } from '@/object-core/agents/hooks/useListenToCoreAgentRunEvents';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { GetAgentRunInsightsDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useCoreAgentRunInsights = (agentId: string) => {
  const canReadCoreAgentRuns = useCanReadCoreAgentRuns();
  const { userTimezone } = useUserTimezone();

  const { data, loading, error, refetch } = useQuery(
    GetAgentRunInsightsDocument,
    {
      variables: { agentId, timeZone: userTimezone },
      fetchPolicy: 'cache-and-network',
      skip: !canReadCoreAgentRuns,
    },
  );

  useListenToCoreAgentRunEvents({
    agentId,
    onRunsChanged: () => {
      if (canReadCoreAgentRuns) {
        void refetch().catch(logError);
      }
    },
  });

  return {
    insights: data?.agentRunInsights ?? null,
    loading,
    error,
  };
};
