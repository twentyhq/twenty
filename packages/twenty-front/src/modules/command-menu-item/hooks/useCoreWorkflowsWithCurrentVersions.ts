import { skipToken, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowsWithCurrentVersionsDocument } from '~/generated/graphql';

export const useCoreWorkflowsWithCurrentVersions = (
  coreWorkflowIds: string[],
): WorkflowWithCurrentVersion[] => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(
    GetCoreWorkflowsWithCurrentVersionsDocument,
    coreWorkflowIds.length === 0
      ? skipToken
      : {
          client: apolloCoreClient,
          variables: { input: { coreWorkflowIds } },
        },
  );

  return (data?.coreWorkflowsWithCurrentVersions ?? []).flatMap(
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
};
