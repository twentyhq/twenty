import { useMutation, useQuery } from '@apollo/client/react';

import {
  CREATE_INGESTION_FIELD_MAPPING,
  CREATE_INGESTION_FIELD_MAPPINGS,
  DELETE_INGESTION_FIELD_MAPPING,
  UPDATE_INGESTION_FIELD_MAPPING,
} from '@/settings/ingestion-pipeline/graphql/ingestion-field-mapping.mutations';
import { GET_INGESTION_FIELD_MAPPINGS } from '@/settings/ingestion-pipeline/graphql/ingestion-field-mapping.queries';
import { type IngestionFieldMapping } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

export const useIngestionFieldMappings = (pipelineId?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    ingestionFieldMappings: IngestionFieldMapping[];
  }>(GET_INGESTION_FIELD_MAPPINGS, {
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const [createMutation] = useMutation<{
    createIngestionFieldMapping: IngestionFieldMapping;
  }>(CREATE_INGESTION_FIELD_MAPPING);
  const [createManyMutation] = useMutation<{
    createIngestionFieldMappings: IngestionFieldMapping[];
  }>(CREATE_INGESTION_FIELD_MAPPINGS);
  const [updateMutation] = useMutation<{
    updateIngestionFieldMapping: IngestionFieldMapping;
  }>(UPDATE_INGESTION_FIELD_MAPPING);
  const [deleteMutation] = useMutation(DELETE_INGESTION_FIELD_MAPPING);

  const createMapping = async (
    input: Omit<IngestionFieldMapping, 'id'>,
  ) => {
    const result = await createMutation({ variables: { input } });

    await refetch();

    return result.data?.createIngestionFieldMapping as IngestionFieldMapping;
  };

  const createManyMappings = async (
    inputs: Omit<IngestionFieldMapping, 'id'>[],
  ) => {
    const result = await createManyMutation({ variables: { inputs } });

    await refetch();

    return result.data
      ?.createIngestionFieldMappings as IngestionFieldMapping[];
  };

  const updateMapping = async (
    id: string,
    update: Partial<Omit<IngestionFieldMapping, 'id' | 'pipelineId'>>,
  ) => {
    const result = await updateMutation({
      variables: { input: { id, update } },
    });

    await refetch();

    return result.data?.updateIngestionFieldMapping as IngestionFieldMapping;
  };

  const deleteMapping = async (id: string) => {
    await deleteMutation({ variables: { id } });
    await refetch();
  };

  return {
    mappings: data?.ingestionFieldMappings ?? [],
    loading,
    error,
    refetch,
    createMapping,
    createManyMappings,
    updateMapping,
    deleteMapping,
  };
};
