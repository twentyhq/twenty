import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowShowPageRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowShowPageRecordFromCoreWorkflow';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

export const useCoreWorkflowShowPageResource = ({
  workspaceWorkflowId,
  skip,
}: {
  workspaceWorkflowId: string;
  skip: boolean;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { workspaceWorkflowId },
    skip,
  });

  return {
    record: buildWorkflowShowPageRecordFromCoreWorkflow(data?.coreWorkflow),
    loading,
    error,
  };
};
