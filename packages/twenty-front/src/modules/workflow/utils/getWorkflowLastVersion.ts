import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const getWorkflowLastVersion = (
  workflow: Workflow,
): WorkflowVersion | undefined => {
  return workflow.versions
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .at(-1);
};
