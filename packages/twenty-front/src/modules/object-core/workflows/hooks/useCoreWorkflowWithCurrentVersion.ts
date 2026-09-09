import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';
import {
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';

export const useCoreWorkflowWithCurrentVersion = ({
  workspaceWorkflowId,
  skip,
  getEffectiveDraftId,
}: {
  workspaceWorkflowId: string | undefined;
  skip: boolean;
  getEffectiveDraftId: (draftVersion: { id: string } | undefined) => {
    effectiveDraftId: string | undefined;
    lastDiscardedDraftId: string | undefined;
  };
}): WorkflowWithCurrentVersion | undefined => {
  const apolloCoreClient = useApolloCoreClient();

  const shouldSkip = skip || !isDefined(workspaceWorkflowId);

  const { data: coreWorkflowData } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { workspaceWorkflowId: workspaceWorkflowId ?? '' },
    skip: shouldSkip,
  });

  const { data: coreWorkflowVersionsData } = useQuery(
    GetCoreWorkflowVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowId: workspaceWorkflowId ?? '' },
      skip: shouldSkip,
    },
  );

  const mirroredVersions = (
    coreWorkflowVersionsData?.coreWorkflowVersions ?? []
  ).flatMap((coreWorkflowVersion) =>
    isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)
      ? [
          {
            ...coreWorkflowVersion,
            workspaceWorkflowVersionId:
              coreWorkflowVersion.workspaceWorkflowVersionId,
          },
        ]
      : [],
  );

  const draftVersionFromServer = mirroredVersions.find(
    (coreWorkflowVersion) => coreWorkflowVersion.status === 'DRAFT',
  );

  const { effectiveDraftId, lastDiscardedDraftId } = getEffectiveDraftId(
    isDefined(draftVersionFromServer)
      ? { id: draftVersionFromServer.workspaceWorkflowVersionId }
      : undefined,
  );

  const versions = mirroredVersions
    .filter(
      (coreWorkflowVersion) =>
        coreWorkflowVersion.workspaceWorkflowVersionId !== lastDiscardedDraftId,
    )
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const currentVersionId =
    effectiveDraftId ?? versions[0]?.workspaceWorkflowVersionId;

  const { data: coreWorkflowVersionData } = useQuery(
    GetCoreWorkflowVersionDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowVersionId: currentVersionId ?? '' },
      skip: shouldSkip || !isDefined(currentVersionId),
    },
  );

  const coreWorkflow = coreWorkflowData?.coreWorkflow;
  const currentCoreVersion = coreWorkflowVersionData?.coreWorkflowVersion;

  if (
    shouldSkip ||
    !isDefined(workspaceWorkflowId) ||
    !isDefined(coreWorkflow) ||
    !isDefined(currentCoreVersion) ||
    !isDefined(currentCoreVersion.workspaceWorkflowVersionId)
  ) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: workspaceWorkflowId,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedVersionId,
    versions: versions.map((coreWorkflowVersion) => ({
      id: coreWorkflowVersion.workspaceWorkflowVersionId,
      name: coreWorkflowVersion.label,
      status: coreWorkflowVersion.status,
      createdAt: coreWorkflowVersion.createdAt,
    })),
    currentVersion: {
      __typename: 'WorkflowVersion',
      id: currentCoreVersion.workspaceWorkflowVersionId,
      name: currentCoreVersion.label,
      status: currentCoreVersion.status,
      workflowId: workspaceWorkflowId,
      createdAt: currentCoreVersion.createdAt,
      updatedAt: currentCoreVersion.updatedAt,
      trigger: currentCoreVersion.trigger,
      steps: currentCoreVersion.steps,
    } as WorkflowVersion,
  } as WorkflowWithCurrentVersion;
};
