export const getCoreWorkflowVersionEditLockKey = (
  coreWorkflowVersionId: string,
): string => `core-workflow-version-edit-${coreWorkflowVersionId}`;
