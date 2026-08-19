import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowsDocument } from '~/generated/graphql';

export const useCoreWorkflows = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(GetCoreWorkflowsDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  return { coreWorkflows: data?.coreWorkflows ?? [], loading, error };
};
