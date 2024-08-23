import { Workflow } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/utils/generateWorkflowDiagram';
import { isDefined } from 'twenty-ui';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

export const getWorkflowLastDiagramVersion = (
  workflow: Workflow | undefined,
): WorkflowDiagram => {
  if (!isDefined(workflow)) {
    return EMPTY_DIAGRAM;
  }

  const lastVersion = workflow.versions.at(-1);
  if (!isDefined(lastVersion) || !isDefined(lastVersion.trigger)) {
    return EMPTY_DIAGRAM;
  }

  return generateWorkflowDiagram({
    trigger: lastVersion.trigger,
    steps: lastVersion.steps,
  });
};
