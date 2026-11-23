import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useCoreWorkflowVersions = (workflowId: string | undefined) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { coreWorkflowId: workflowId ?? '' },
      skip: !isDefined(workflowId),
    },
  );

  return {
    coreWorkflowVersions: data?.coreWorkflowVersions ?? [],
    loading,
    error,
    refetchCoreWorkflowVersions: refetch,
  };
};
