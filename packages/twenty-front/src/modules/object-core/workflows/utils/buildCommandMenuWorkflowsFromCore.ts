import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuWorkflowFromCore } from '@/command-menu-item/types/CommandMenuWorkflow';
import { type CoreWorkflowWithCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';

export const buildCommandMenuWorkflowsFromCore = (
  coreWorkflows: CoreWorkflowWithCurrentVersion[],
): CommandMenuWorkflowFromCore[] =>
  coreWorkflows.flatMap((coreWorkflow) => {
    const { currentVersion } = coreWorkflow;

    if (
      !isDefined(currentVersion) ||
      !isDefined(currentVersion.workspaceWorkflowVersionId)
    ) {
      return [];
    }

    return [
      {
        id: coreWorkflow.id,
        workspaceWorkflowId: coreWorkflow.workspaceWorkflowId ?? null,
        statuses: coreWorkflow.statuses,
        lastPublishedVersionId: coreWorkflow.lastPublishedVersionId ?? null,
        currentVersion: {
          __typename: 'WorkflowVersion',
          id: currentVersion.workspaceWorkflowVersionId,
          name: currentVersion.label,
          createdAt: currentVersion.createdAt,
          updatedAt: currentVersion.updatedAt,
          workflowId: currentVersion.workspaceWorkflowId,
          trigger: currentVersion.trigger ?? null,
          steps: currentVersion.steps ?? null,
          status: currentVersion.status,
        },
      },
    ];
  });
