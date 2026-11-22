import { WorkflowVisibility } from 'twenty-shared/types';

export const getCoreWorkflowVisibilityFromIsPrivate = (
  isPrivate: boolean,
): WorkflowVisibility =>
  isPrivate ? WorkflowVisibility.PRIVATE : WorkflowVisibility.WORKSPACE;
