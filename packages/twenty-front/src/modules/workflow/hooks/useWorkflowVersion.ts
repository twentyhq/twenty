import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowVersionDocument,
} from '~/generated/graphql';

export const useWorkflowVersion = (workflowVersionId?: string) => {
  const client = useApolloCoreClient();
  const { data } = useQuery(GetCoreWorkflowVersionDocument, {
    client,
    variables: { coreWorkflowVersionId: workflowVersionId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !workflowVersionId,
  });
  const coreWorkflowId = data?.coreWorkflowVersion?.coreWorkflowId;
  const { data: workflowData } = useQuery(GetCoreWorkflowDocument, {
    client,
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !coreWorkflowId,
  });

  return useMemo(() => {
    const version = buildWorkflowVersionFromCore(data?.coreWorkflowVersion);

    return version
      ? {
          ...version,
          workflow: {
            id: version.workflowId,
            name: workflowData?.coreWorkflow?.name ?? '',
          },
        }
      : undefined;
  }, [data, workflowData]);
};
