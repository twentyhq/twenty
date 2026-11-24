import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GetCoreWorkflowDocument } from '~/generated/graphql';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';

export const useWorkflowVersion = (workflowVersionId?: string) => {
  const client = useApolloCoreClient();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(workflowVersionId);
  const coreWorkflowId = coreWorkflowVersion?.coreWorkflowId;
  const { data: workflowData } = useQuery(GetCoreWorkflowDocument, {
    client,
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !coreWorkflowId,
  });

  return useMemo(() => {
    const version = buildWorkflowVersionFromCore(coreWorkflowVersion);
    return version
      ? {
          ...version,
          workflow: {
            id: version.workflowId,
            name: workflowData?.coreWorkflow?.name ?? '',
          },
        }
      : undefined;
  }, [coreWorkflowVersion, workflowData]);
};
