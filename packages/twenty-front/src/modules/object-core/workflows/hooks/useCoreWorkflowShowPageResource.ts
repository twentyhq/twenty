import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowShowPageRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowShowPageRecordFromCoreWorkflow';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

export const useCoreWorkflowShowPageResource = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { coreWorkflowId },
  });

  const record = useMemo(
    () => buildWorkflowShowPageRecordFromCoreWorkflow(data?.coreWorkflow),
    [data?.coreWorkflow],
  );

<<<<<<< HEAD
  return {
    record,
    coreWorkflowId: data?.coreWorkflow?.id,
    loading,
    error,
    refetch,
  };
=======
  return { record, coreWorkflow: data?.coreWorkflow, loading, error, refetch };
>>>>>>> tt-workflow-core-sse
};
