import { useQuery } from '@apollo/client/react';

import { CORE_AGENT_RUNS_POLL_INTERVAL_IN_MS } from '@/object-core/agents/constants/CoreAgentRunsPollIntervalInMs';
import { useCanReadCoreAgentRuns } from '@/object-core/agents/hooks/useCanReadCoreAgentRuns';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { GetAgentRunInsightsDocument } from '~/generated-metadata/graphql';

export const useCoreAgentRunInsights = (agentId: string) => {
  const canReadCoreAgentRuns = useCanReadCoreAgentRuns();
  const { userTimezone } = useUserTimezone();

  // runs start and settle outside this page, so the insights refresh while it is visible
  const { data, loading, error } = useQuery(GetAgentRunInsightsDocument, {
    variables: { agentId, timeZone: userTimezone },
    fetchPolicy: 'cache-and-network',
    skip: !canReadCoreAgentRuns,
    pollInterval: CORE_AGENT_RUNS_POLL_INTERVAL_IN_MS,
    skipPollAttempt: () => document.hidden,
  });

  return {
    insights: data?.agentRunInsights ?? null,
    loading,
    error,
  };
};
