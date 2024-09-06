import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/utils/generateWorkflowDiagram';
import { isDefined } from 'twenty-ui';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

export const getWorkflowVersionDiagram = (
  workflowVersion: WorkflowVersion | undefined,
): WorkflowDiagram => {
  if (
    !(
      isDefined(workflowVersion) &&
      isDefined(workflowVersion.trigger) &&
      isDefined(workflowVersion.steps)
    )
  ) {
    return EMPTY_DIAGRAM;
  }

  return generateWorkflowDiagram({
    trigger: workflowVersion.trigger,
    steps: workflowVersion.steps,
  });
};
