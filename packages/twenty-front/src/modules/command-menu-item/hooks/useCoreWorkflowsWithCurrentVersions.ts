import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getCurrentWorkflowVersionId } from '@/command-menu-item/utils/getCurrentWorkflowVersionId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  buildWorkflowFromCoreWorkflowWithVersions,
  buildWorkflowsWithCurrentVersionsFromCore,
} from '@/object-core/workflows/utils/buildWorkflowsWithCurrentVersionsFromCore';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import {
  GetCoreWorkflowsWithVersionsDocument,
  GetCoreWorkflowVersionsByIdsDocument,
} from '~/generated/graphql';

export const useCoreWorkflowsWithCurrentVersions = (
  workflowIds: string[],
): { workflows: WorkflowWithCurrentVersion[]; isCoreDataComplete: boolean } => {
  const apolloCoreClient = useApolloCoreClient();

  const { data: coreWorkflowsData, error: coreWorkflowsError } = useQuery(
    GetCoreWorkflowsWithVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowIds: workflowIds },
      skip: workflowIds.length === 0,
    },
  );

  const coreWorkflows = useMemo(
    () => coreWorkflowsData?.coreWorkflowsWithVersions ?? [],
    [coreWorkflowsData?.coreWorkflowsWithVersions],
  );

  const currentVersionIds = useMemo(
    () =>
      coreWorkflows.flatMap((coreWorkflow) => {
        const workflow =
          buildWorkflowFromCoreWorkflowWithVersions(coreWorkflow);

        if (!isDefined(workflow)) {
          return [];
        }

        const currentVersionId = getCurrentWorkflowVersionId(workflow);

        return isDefined(currentVersionId) ? [currentVersionId] : [];
      }),
    [coreWorkflows],
  );

  const { data: coreWorkflowVersionsData } = useQuery(
    GetCoreWorkflowVersionsByIdsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowVersionIds: currentVersionIds },
      skip: currentVersionIds.length === 0,
    },
  );

  const workflows = useMemo(
    () =>
      buildWorkflowsWithCurrentVersionsFromCore({
        coreWorkflows,
        coreWorkflowVersionsWithContent:
          coreWorkflowVersionsData?.coreWorkflowVersionsByIds ?? [],
        getCurrentVersionId: getCurrentWorkflowVersionId,
      }),
    [coreWorkflows, coreWorkflowVersionsData?.coreWorkflowVersionsByIds],
  );

  const isCoreDataComplete =
    !isDefined(coreWorkflowsError) &&
    coreWorkflows.length === workflowIds.length;

  return { workflows, isCoreDataComplete };
};
