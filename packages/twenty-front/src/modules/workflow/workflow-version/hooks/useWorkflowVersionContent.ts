import { useMemo } from 'react';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';

export type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

export const useWorkflowVersionContent = (workflowVersionId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const core = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowVersionId: workflowVersionId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !isCore || !isDefined(workflowVersionId),
  });
  const coreContent = useMemo(() => {
    const version = core.data?.coreWorkflowVersion;
    return isDefined(version)
      ? {
          workflowVersionId: version.id,
          trigger: version.trigger,
          steps: version.steps,
        }
      : undefined;
  }, [core.data]);

  const { data, loading, refetch } = useQuery<{
    workflowVersionContent: WorkflowVersionContent;
  }>(GET_WORKFLOW_VERSION_CONTENT, {
    client: apolloCoreClient,
    variables: { workflowVersionId },
    skip: isCore || !isDefined(workflowVersionId),
  });

  return {
    content: isCore ? coreContent : data?.workflowVersionContent,
    loading: isCore ? core.loading : loading,
    refetchContent: isCore ? core.refetch : refetch,
    contentUpdatedAt: isCore
      ? core.data?.coreWorkflowVersion?.updatedAt
      : undefined,
    error: core.error,
  };
};
