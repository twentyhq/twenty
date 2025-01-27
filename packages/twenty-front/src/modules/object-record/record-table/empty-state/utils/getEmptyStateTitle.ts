export const getEmptyStateTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === 'workflowVersion') {
    return 'No workflow versions yet.';
  }

  if (objectNameSingular === 'workflowRun') {
    return 'No workflow runs yet.';
  }

  return `Add your first ${objectLabel}`;
};
