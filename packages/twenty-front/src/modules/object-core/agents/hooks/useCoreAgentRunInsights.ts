import { useQuery } from '@apollo/client/react';

import { CORE_AGENT_RUNS_POLL_INTERVAL_IN_MS } from '@/object-core/agents/constants/CoreAgentRunsPollIntervalInMs';
import { useCanReadCoreAgentRuns } from '@/object-core/agents/hooks/useCanReadCoreAgentRuns';
import { getCoreObjectRunInsightsHasRuns } from '@/object-core/utils/getCoreObjectRunInsightsHasRuns';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { GetAgentRunInsightsDocument } from '~/generated-metadata/graphql';

export const useCoreAgentRunInsights = (agentId: string) => {
  const canReadCoreAgentRuns = useCanReadCoreAgentRuns();
  const { userTimezone } = useUserTimezone();

  const { data, loading, error } = useQuery(GetAgentRunInsightsDocument, {
    variables: { agentId, timeZone: userTimezone },
    fetchPolicy: 'cache-and-network',
    skip: !canReadCoreAgentRuns,
    pollInterval: CORE_AGENT_RUNS_POLL_INTERVAL_IN_MS,
    skipPollAttempt: () => document.hidden,
  });

  return {
    insights: data?.agentRunInsights ?? null,
    hasRuns: getCoreObjectRunInsightsHasRuns({
      isLoading: loading,
      runCount: data?.agentRunInsights.runCount,
    }),
    loading,
    error,
  };
};
