import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';

type UseActiveWorkflowVersionProps = {
  workflowId: string;
};

export const useActiveWorkflowVersion = ({
  workflowId,
}: UseActiveWorkflowVersionProps) => {
  const client = useApolloCoreClient();
  const { data, loading } = useQuery(GetCoreWorkflowVersionsDocument, {
    client,
    variables: { coreWorkflowId: workflowId },
    skip: !workflowId,
  });

  return {
    workflowVersion: data?.coreWorkflowVersions.find(
      (version) => version.status === 'ACTIVE',
    ),
    hasDraftVersion: data?.coreWorkflowVersions.some(
      (version) => version.status === 'DRAFT',
    ),
    loading,
  };
};
