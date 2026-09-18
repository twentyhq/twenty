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

  return { record, loading, error, refetch };
};
