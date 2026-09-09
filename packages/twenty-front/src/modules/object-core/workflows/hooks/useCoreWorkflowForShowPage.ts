import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type WorkflowStatus,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import {
  CoreWorkflowVersionStatus,
  GetCoreWorkflowDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

type CoreWorkflowShowPageVersion = Pick<
  WorkflowVersion,
  'id' | 'name' | 'status' | 'createdAt'
>;

export const useCoreWorkflowForShowPage = ({
  workspaceWorkflowId,
  skip,
}: {
  workspaceWorkflowId: string | undefined;
  skip: boolean;
}): {
  coreWorkflow:
    | {
        id: string;
        name: string;
        statuses: WorkflowStatus[] | null;
        lastPublishedVersionId: string | null;
      }
    | undefined;
  versions: CoreWorkflowShowPageVersion[];
  draftVersionIdFromServer: string | undefined;
} => {
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

  const coreWorkflow = coreWorkflowData?.coreWorkflow;

  const versions = (
    coreWorkflowVersionsData?.coreWorkflowVersions ?? []
  ).flatMap((coreWorkflowVersion) =>
    isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)
      ? [
          {
            id: coreWorkflowVersion.workspaceWorkflowVersionId,
            name: coreWorkflowVersion.label,
            status:
              coreWorkflowVersion.status as unknown as WorkflowVersion['status'],
            createdAt: coreWorkflowVersion.createdAt,
          },
        ]
      : [],
  );

  const draftVersionIdFromServer = (
    coreWorkflowVersionsData?.coreWorkflowVersions ?? []
  ).find(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.DRAFT,
  )?.workspaceWorkflowVersionId;

  return {
    coreWorkflow: isDefined(coreWorkflow)
      ? {
          id: coreWorkflow.workspaceWorkflowId,
          name: coreWorkflow.name ?? '',
          statuses: coreWorkflow.statuses,
          lastPublishedVersionId: coreWorkflow.lastPublishedVersionId,
        }
      : undefined,
    versions,
    draftVersionIdFromServer: draftVersionIdFromServer ?? undefined,
  };
};
