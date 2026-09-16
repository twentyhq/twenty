import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useCoreWorkflowVersionContent = ({
  coreWorkflowId,
  coreWorkflowVersionId,
  skip,
}: {
  coreWorkflowId: string | undefined;
  coreWorkflowVersionId: string | undefined;
  skip: boolean;
}): WorkflowVersion | undefined => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: {
      coreWorkflowVersionId: coreWorkflowVersionId ?? '',
    },
    skip:
      skip || !isDefined(coreWorkflowVersionId) || !isDefined(coreWorkflowId),
  });

  const coreWorkflowVersion = data?.coreWorkflowVersion;

  if (
    !isDefined(coreWorkflowVersion) ||
    !isDefined(coreWorkflowId) ||
    !isDefined(coreWorkflowVersionId) ||
    coreWorkflowVersion.id !== coreWorkflowVersionId ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  ) {
    return undefined;
  }

  return {
    __typename: 'WorkflowVersion',
    id: coreWorkflowVersionId,
    name: coreWorkflowVersion.label,
    status: coreWorkflowVersion.status,
    workflowId: coreWorkflowId,
    createdAt: coreWorkflowVersion.createdAt,
    updatedAt: coreWorkflowVersion.updatedAt,
    trigger: coreWorkflowVersion.trigger,
    steps: coreWorkflowVersion.steps,
  };
};
