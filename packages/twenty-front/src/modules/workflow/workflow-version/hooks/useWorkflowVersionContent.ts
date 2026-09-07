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

  const { data, loading, refetch } = useQuery<{
    workflowVersionContent: WorkflowVersionContent;
  }>(GET_WORKFLOW_VERSION_CONTENT, {
    client: apolloCoreClient,
    variables: { workflowVersionId },
    skip: !isDefined(workflowVersionId),
  });

  return {
    content: data?.workflowVersionContent,
    loading,
    refetchContent: refetch,
  };
};
