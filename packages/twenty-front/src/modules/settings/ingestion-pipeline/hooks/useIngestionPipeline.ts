import { useMutation, useQuery } from '@apollo/client/react';

import {
  CREATE_INGESTION_PIPELINE,
  DELETE_INGESTION_PIPELINE,
  TRIGGER_INGESTION_PULL,
  UPDATE_INGESTION_PIPELINE,
} from '@/settings/ingestion-pipeline/graphql/ingestion-pipeline.mutations';
import {
  GET_INGESTION_PIPELINE,
  GET_INGESTION_PIPELINES,
} from '@/settings/ingestion-pipeline/graphql/ingestion-pipeline.queries';
import { type IngestionPipeline } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

export const useIngestionPipeline = (pipelineId?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    ingestionPipeline: IngestionPipeline | null;
  }>(GET_INGESTION_PIPELINE, {
    variables: { id: pipelineId },
    skip: !pipelineId,
  });

  const [createMutation] = useMutation<{
    createIngestionPipeline: IngestionPipeline;
  }>(CREATE_INGESTION_PIPELINE, {
    refetchQueries: [{ query: GET_INGESTION_PIPELINES }],
  });

  const [updateMutation] = useMutation<{
    updateIngestionPipeline: IngestionPipeline;
  }>(UPDATE_INGESTION_PIPELINE, {
    refetchQueries: [{ query: GET_INGESTION_PIPELINES }],
  });

  const [deleteMutation] = useMutation(DELETE_INGESTION_PIPELINE, {
    refetchQueries: [{ query: GET_INGESTION_PIPELINES }],
  });

  const [triggerPullMutation] = useMutation<{
    triggerIngestionPull: unknown;
  }>(TRIGGER_INGESTION_PULL);

  const createPipeline = async (
    input: Omit<IngestionPipeline, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'webhookSecret'>,
  ) => {
    const result = await createMutation({ variables: { input } });

    return result.data?.createIngestionPipeline as IngestionPipeline;
  };

  const updatePipeline = async (
    id: string,
    update: Partial<
      Omit<IngestionPipeline, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ) => {
    const result = await updateMutation({
      variables: { input: { id, update } },
    });

    return result.data?.updateIngestionPipeline as IngestionPipeline;
  };

  const deletePipeline = async (id: string) => {
    await deleteMutation({ variables: { id } });
  };

  const triggerPull = async (targetPipelineId: string) => {
    const result = await triggerPullMutation({
      variables: { pipelineId: targetPipelineId },
    });

    return result.data?.triggerIngestionPull;
  };

  return {
    pipeline: data?.ingestionPipeline ?? null,
    loading,
    error,
    refetch,
    createPipeline,
    updatePipeline,
    deletePipeline,
    triggerPull,
  };
};
