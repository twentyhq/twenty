export const getEmptyStateSubTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === 'workflowVersion') {
    return 'Create a workflow and return here to view its versions.';
  }

  if (objectNameSingular === 'workflowRun') {
    return 'Run a workflow and return here to view its executions.';
  }

  return `Use our API or add your first ${objectLabel} manually`;
};
