import { useMemo } from 'react';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';

export type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

export const useWorkflowVersionContent = (workflowVersionId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const core = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowVersionId: workflowVersionId ?? '' },
    fetchPolicy: 'cache-and-network',
    // A deduplicated refetch resolves with an in-flight read that may have
    // been sent before the write this refetch is meant to pick up.
    context: { queryDeduplication: false },
    skip: !isDefined(workflowVersionId),
  });
  const content = useMemo<WorkflowVersionContent | undefined>(() => {
    const version = core.data?.coreWorkflowVersion;
    return isDefined(version)
      ? {
          workflowVersionId: version.id,
          trigger: version.trigger,
          steps: version.steps,
        }
      : undefined;
  }, [core.data]);

  return {
    content,
    loading: core.loading,
    refetchContent: core.refetch,
    contentUpdatedAt: core.data?.coreWorkflowVersion?.updatedAt,
    error: core.error,
  };
};
