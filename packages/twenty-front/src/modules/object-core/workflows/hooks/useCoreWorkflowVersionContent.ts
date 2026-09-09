import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useCoreWorkflowVersionContent = ({
  workspaceWorkflowId,
  workspaceWorkflowVersionId,
  skip,
}: {
  workspaceWorkflowId: string | undefined;
  workspaceWorkflowVersionId: string | undefined;
  skip: boolean;
}): WorkflowVersion | undefined => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: {
      workspaceWorkflowVersionId: workspaceWorkflowVersionId ?? '',
    },
    skip:
      skip ||
      !isDefined(workspaceWorkflowVersionId) ||
      !isDefined(workspaceWorkflowId),
  });

  const coreWorkflowVersion = data?.coreWorkflowVersion;

  if (
    !isDefined(coreWorkflowVersion) ||
    !isDefined(coreWorkflowVersion.workspaceWorkflowVersionId) ||
    !isDefined(workspaceWorkflowId)
  ) {
    return undefined;
  }

  return {
    __typename: 'WorkflowVersion',
    id: coreWorkflowVersion.workspaceWorkflowVersionId,
    name: coreWorkflowVersion.label,
    status: coreWorkflowVersion.status,
    workflowId: workspaceWorkflowId,
    createdAt: coreWorkflowVersion.createdAt,
    updatedAt: coreWorkflowVersion.updatedAt,
    trigger: coreWorkflowVersion.trigger,
    steps: coreWorkflowVersion.steps,
  };
};
