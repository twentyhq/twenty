import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';

export const useCoreWorkflowVersions = (workflowId: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowId: workflowId },
    },
  );

  return {
    coreWorkflowVersions: data?.coreWorkflowVersions ?? [],
    loading,
    error,
    refetchCoreWorkflowVersions: refetch,
  };
};
