import { useQuery } from '@apollo/client/react';

import { GET_INGESTION_PIPELINES } from '@/settings/ingestion-pipeline/graphql/ingestion-pipeline.queries';
import { type IngestionPipeline } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

export const useIngestionPipelines = () => {
  const { data, loading, error, refetch } = useQuery<{
    ingestionPipelines: IngestionPipeline[];
  }>(GET_INGESTION_PIPELINES);

  return {
    pipelines: data?.ingestionPipelines ?? [],
    loading,
    error,
    refetch,
  };
};
