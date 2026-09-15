import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuWorkflow } from '@/command-menu-item/types/CommandMenuWorkflow';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildCommandMenuWorkflowsFromCore } from '@/object-core/workflows/utils/buildCommandMenuWorkflowsFromCore';
import { GetCoreWorkflowsWithCurrentVersionDocument } from '~/generated/graphql';

export const useCoreWorkflowsWithCurrentVersions = (
  workflowIds: string[],
): {
  workflows: CommandMenuWorkflow[];
  isCoreEnrichmentLoading: boolean;
  isCoreEnrichmentComplete: boolean;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(
    GetCoreWorkflowsWithCurrentVersionDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowIds: workflowIds },
      skip: workflowIds.length === 0,
    },
  );

  const workflows = useMemo(
    () =>
      buildCommandMenuWorkflowsFromCore(
        data?.coreWorkflowsWithCurrentVersion ?? [],
      ),
    [data?.coreWorkflowsWithCurrentVersion],
  );

  const isCoreEnrichmentLoading = workflowIds.length > 0 && loading;

  const isCoreEnrichmentComplete =
    !isDefined(error) &&
    new Set(workflows.map((workflow) => workflow.id)).size ===
      new Set(workflowIds).size;

  return { workflows, isCoreEnrichmentLoading, isCoreEnrichmentComplete };
};
