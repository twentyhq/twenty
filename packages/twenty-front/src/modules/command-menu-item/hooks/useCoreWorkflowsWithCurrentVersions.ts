import { skipToken, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { GetCoreWorkflowsWithCurrentVersionsDocument } from '~/generated/graphql';

export const useCoreWorkflowsWithCurrentVersions = (
  coreWorkflowIds: string[],
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, previousData, loading, error } = useQuery(
    GetCoreWorkflowsWithCurrentVersionsDocument,
    coreWorkflowIds.length === 0
      ? skipToken
      : {
          client: apolloCoreClient,
          variables: { input: { coreWorkflowIds } },
        },
  );

  const workflows = (
    data ?? previousData
  )?.coreWorkflowsWithCurrentVersions.flatMap(
    ({ workflow, versions, currentVersion }) => {
      const builtCurrentVersion = buildWorkflowVersionFromCore(currentVersion);

      if (!isDefined(builtCurrentVersion)) {
        return [];
      }

      return [
        {
          __typename: 'Workflow' as const,
          id: workflow.id,
          name: workflow.name ?? '',
          statuses: workflow.statuses,
          lastPublishedVersionId:
            workflow.lastPublishedCoreWorkflowVersionId ?? null,
          versions: versions.map((version) => ({
            id: version.id,
            name: version.label,
            status: version.status,
            createdAt: version.createdAt,
          })),
          currentVersion: builtCurrentVersion,
        },
      ];
    },
  );

  return { workflows: workflows ?? [], loading, error };
};
