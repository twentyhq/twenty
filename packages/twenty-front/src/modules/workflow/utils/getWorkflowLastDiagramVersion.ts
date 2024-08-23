import { Workflow } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { generateWorklowDiagram } from '@/workflow/utils/generateWorkflowDiagram';
import { isDefined } from 'twenty-ui';

const EMPTY_FLOW_DATA: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

export const getWorkflowLastDiagramVersion = (
  workflow: Workflow | undefined,
): WorkflowDiagram => {
  if (!isDefined(workflow)) {
    return EMPTY_FLOW_DATA;
  }

  const lastVersion = workflow.versions.at(-1);
  if (!isDefined(lastVersion) || !isDefined(lastVersion.trigger)) {
    return EMPTY_FLOW_DATA;
  }

  return generateWorklowDiagram({
    trigger: lastVersion.trigger,
    steps: lastVersion.steps,
  });
};
