import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

/**
 * This function orders all workflow's versions by the createdAt property in ascending order (oldest first, newest last).
 * It returns the last version of the sorted array, that is, the newest one.
 *
 * FIXME: Optimize how we get the last version. We shouldn't fetch all the versions when we only need the most recent one.
 */
export const getWorkflowLastVersion = (
  workflow: Workflow,
): WorkflowVersion | undefined => {
  return workflow.versions
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .at(-1);
};
