import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { transformFilterNodesAsEdges } from '@/workflow/workflow-diagram/utils/transformFilterNodesAsEdges';
import { isDefined } from 'twenty-shared/utils';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

export const getWorkflowVersionDiagram = (
  workflowVersion: WorkflowVersion | undefined,
): WorkflowDiagram => {
  if (!isDefined(workflowVersion)) {
    return EMPTY_DIAGRAM;
  }

  return transformFilterNodesAsEdges(
    generateWorkflowDiagram({
      trigger: workflowVersion.trigger ?? undefined,
      steps: workflowVersion.steps ?? [],
    }),
  );
};
