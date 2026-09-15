import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowWithVersions } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { type Workflow } from '@/workflow/types/Workflow';

export const buildWorkflowFromCoreWorkflowWithVersions = (
  coreWorkflow: CoreWorkflowWithVersions,
): Workflow | undefined => {
  if (!isDefined(coreWorkflow.workspaceWorkflowId)) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: coreWorkflow.workspaceWorkflowId,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedVersionId ?? null,
    versions: coreWorkflow.versions.flatMap((coreWorkflowVersion) =>
      isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)
        ? [
            {
              id: coreWorkflowVersion.workspaceWorkflowVersionId,
              name: coreWorkflowVersion.label,
              status: coreWorkflowVersion.status,
              createdAt: coreWorkflowVersion.createdAt,
            },
          ]
        : [],
    ),
  };
};
