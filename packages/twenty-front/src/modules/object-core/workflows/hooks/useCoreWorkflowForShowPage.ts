import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

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
}: {
  coreWorkflowId: string | undefined;
}): {
  coreWorkflow: CoreWorkflowShowPageWorkflow | undefined;
  versions: CoreWorkflowShowPageVersion[];
} => {
  const apolloCoreClient = useApolloCoreClient();

  const { data: coreWorkflowData } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    skip: !isDefined(coreWorkflowId),
  });

  const { coreWorkflowVersions } = useCoreWorkflowVersions(coreWorkflowId);

  const coreWorkflow = coreWorkflowData?.coreWorkflow;

  const versions = coreWorkflowVersions.map((version) => ({
    id: version.id,
    name: version.label,
    status: version.status,
    createdAt: version.createdAt,
  }));

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
  };
};
