import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuWorkflow } from '@/command-menu-item/types/CommandMenuWorkflow';
import { type CoreWorkflowWithCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';

export const buildCommandMenuWorkflowsFromCore = (
  coreWorkflows: CoreWorkflowWithCurrentVersion[],
): CommandMenuWorkflow[] =>
  coreWorkflows.flatMap((coreWorkflow) => {
    const { workspaceWorkflowId, currentVersion } = coreWorkflow;

    if (
      !isDefined(workspaceWorkflowId) ||
      !isDefined(currentVersion) ||
      !isDefined(currentVersion.workspaceWorkflowVersionId)
    ) {
      return [];
    }

    return [
      {
        id: workspaceWorkflowId,
        statuses: coreWorkflow.statuses,
        lastPublishedVersionId: coreWorkflow.lastPublishedVersionId ?? null,
        currentVersion: {
          __typename: 'WorkflowVersion',
          id: currentVersion.workspaceWorkflowVersionId,
          name: currentVersion.label,
          createdAt: currentVersion.createdAt,
          updatedAt: currentVersion.updatedAt,
          workflowId: workspaceWorkflowId,
          trigger: currentVersion.trigger ?? null,
          steps: currentVersion.steps ?? null,
          status: currentVersion.status,
        },
      },
    ];
  });
