import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useCoreWorkflowVersion = (coreWorkflowVersionId: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { coreWorkflowVersionId },
  });

  return {
    coreWorkflowVersion: data?.coreWorkflowVersion ?? null,
    loading,
    error,
  };
};
