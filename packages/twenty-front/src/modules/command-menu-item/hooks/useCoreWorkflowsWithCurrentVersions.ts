import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowsWithCurrentVersionsFromCore } from '@/object-core/workflows/utils/buildWorkflowsWithCurrentVersionsFromCore';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowsWithVersionsDocument } from '~/generated/graphql';

export const useCoreWorkflowsWithCurrentVersions = (
  workflowIds: string[],
): {
  workflows: WorkflowWithCurrentVersion[];
  isCoreEnrichmentLoading: boolean;
  isCoreEnrichmentComplete: boolean;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(
    GetCoreWorkflowsWithVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowIds: workflowIds },
      skip: workflowIds.length === 0,
    },
  );

  const workflows = useMemo(
    () =>
      buildWorkflowsWithCurrentVersionsFromCore(
        data?.coreWorkflowsWithVersions ?? [],
      ),
    [data?.coreWorkflowsWithVersions],
  );

  const isCoreEnrichmentLoading = workflowIds.length > 0 && loading;

  const isCoreEnrichmentComplete =
    !isDefined(error) &&
    new Set(workflows.map((workflow) => workflow.id)).size ===
      new Set(workflowIds).size;

  return { workflows, isCoreEnrichmentLoading, isCoreEnrichmentComplete };
};
