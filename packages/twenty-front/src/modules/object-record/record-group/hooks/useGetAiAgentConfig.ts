import { useQuery } from '@apollo/client';
import {
  AiAgentConfig,
  AiAgentConfigFilter,
  GET_AI_AGENT_CONFIG
} from '../services/aiAgentWorkflowService';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useGetAiAgentConfig = (filter: AiAgentConfigFilter) => {
  const apolloCoreClient = useApolloCoreClient();
  const shouldSkip = !filter.viewGroupId || !filter.objectMetadataId || !filter.fieldMetadataId || !filter.viewId;
  
  const { data, loading, error, refetch } = useQuery<
    { aiAgentConfig: AiAgentConfig },
    { filter: AiAgentConfigFilter }
  >(GET_AI_AGENT_CONFIG, {
    variables: { filter },
    skip: shouldSkip,
    fetchPolicy: 'network-only', // Always fetch fresh data
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    client: apolloCoreClient,
  });

  // Return the configuration directly (it's a single object, not an array)
  const aiAgentConfig = data?.aiAgentConfig || null;

  return {
    aiAgentConfig,
    loading,
    error,
    refetch,
  };
}; 