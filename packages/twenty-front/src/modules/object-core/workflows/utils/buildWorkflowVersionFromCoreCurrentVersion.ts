import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { type WorkflowVersion } from '@/workflow/types/Workflow';

export const buildWorkflowVersionFromCoreCurrentVersion = (
  coreCurrentVersion: CoreWorkflowCurrentVersion,
): WorkflowVersion | undefined => {
  if (!isDefined(coreCurrentVersion.workspaceWorkflowVersionId)) {
    return undefined;
  }

  return {
    __typename: 'WorkflowVersion',
    id: coreCurrentVersion.workspaceWorkflowVersionId,
    name: coreCurrentVersion.label,
    createdAt: coreCurrentVersion.createdAt,
    updatedAt: coreCurrentVersion.updatedAt,
    workflowId: coreCurrentVersion.workspaceWorkflowId,
    trigger: coreCurrentVersion.trigger ?? null,
    steps: coreCurrentVersion.steps ?? null,
    status: coreCurrentVersion.status,
  };
};
