import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const getWorkflowLastVersion = (
  workflow: Workflow,
): WorkflowVersion | undefined => {
  return workflow.versions.at(-1);
};
