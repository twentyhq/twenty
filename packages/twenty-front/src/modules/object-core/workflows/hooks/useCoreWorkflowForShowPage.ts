import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import {
  CoreWorkflowVersionStatus,
  GetCoreWorkflowDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

type CoreWorkflowShowPageVersion = Pick<
  WorkflowVersion,
  'id' | 'name' | 'status' | 'createdAt'
>;

type CoreWorkflowShowPageWorkflow = Pick<
  Workflow,
  'id' | 'name' | 'statuses' | 'lastPublishedVersionId'
>;

export const useCoreWorkflowForShowPage = ({
  coreWorkflowId,
  skip,
}: {
  coreWorkflowId: string | undefined;
  skip: boolean;
}): {
  coreWorkflow: CoreWorkflowShowPageWorkflow | undefined;
  versions: CoreWorkflowShowPageVersion[];
  draftVersionIdFromServer: string | undefined;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const shouldSkip = skip || !isDefined(coreWorkflowId);

  const { data: coreWorkflowData } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    skip: shouldSkip,
  });

  const { data: coreWorkflowVersionsData } = useQuery(
    GetCoreWorkflowVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { coreWorkflowId: coreWorkflowId ?? '' },
      skip: shouldSkip,
    },
  );

  const coreWorkflow = coreWorkflowData?.coreWorkflow;

  const versions = (coreWorkflowVersionsData?.coreWorkflowVersions ?? []).map(
    (version) => ({
      id: version.id,
      name: version.label,
      status: version.status,
      createdAt: version.createdAt,
    }),
  );

  const draftVersionIdFromServer = versions.find(
    (version) => version.status === CoreWorkflowVersionStatus.DRAFT,
  )?.id;

  return {
    coreWorkflow: isDefined(coreWorkflow)
      ? {
          id: coreWorkflow.id,
          name: coreWorkflow.name ?? '',
          statuses: coreWorkflow.statuses,
          lastPublishedVersionId:
            coreWorkflow.lastPublishedCoreWorkflowVersionId,
        }
      : undefined,
    versions,
    draftVersionIdFromServer,
  };
};
