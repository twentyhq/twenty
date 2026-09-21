import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useCoreWorkflowVersion = (
  coreWorkflowVersionId: string | undefined,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { coreWorkflowVersionId: coreWorkflowVersionId ?? '' },
    skip: !isDefined(coreWorkflowVersionId),
  });

  return {
    coreWorkflowVersion: data?.coreWorkflowVersion ?? null,
    loading,
    error,
  };
};
