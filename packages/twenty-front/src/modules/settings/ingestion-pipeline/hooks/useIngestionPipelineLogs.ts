import { useQuery } from '@apollo/client/react';

import { GET_INGESTION_LOGS } from '@/settings/ingestion-pipeline/graphql/ingestion-log.queries';
import { type IngestionLog } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

export const useIngestionPipelineLogs = (
  pipelineId?: string,
  limit = 50,
) => {
  const { data, loading, error, refetch } = useQuery<{
    ingestionLogs: IngestionLog[];
  }>(GET_INGESTION_LOGS, {
    variables: { pipelineId, limit },
    skip: !pipelineId,
    pollInterval: 10000,
  });

  return {
    logs: data?.ingestionLogs ?? [],
    loading,
    error,
    refetch,
  };
};
