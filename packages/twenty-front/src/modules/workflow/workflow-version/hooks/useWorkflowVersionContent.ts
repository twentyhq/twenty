import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

export const useWorkflowVersionContent = (workflowVersionId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const { data, loading, refetch, error } = useQuery(
    GetCoreWorkflowVersionDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowVersionId: workflowVersionId ?? '' },
      fetchPolicy: 'cache-and-network',
      skip: !isDefined(workflowVersionId),
    },
  );

  const content = useMemo<WorkflowVersionContent | undefined>(() => {
    const version = data?.coreWorkflowVersion;

    return isDefined(version)
      ? {
          workflowVersionId: version.id,
          trigger: version.trigger,
          steps: version.steps,
        }
      : undefined;
  }, [data]);

  return {
    content,
    loading,
    refetchContent: refetch,
    contentUpdatedAt: data?.coreWorkflowVersion?.updatedAt,
    error,
  };
};
