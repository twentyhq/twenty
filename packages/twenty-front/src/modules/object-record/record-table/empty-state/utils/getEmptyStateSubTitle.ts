import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getEmptyStateSubTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkflowVersion) {
    return 'Create a workflow and return here to view its versions';
  }

  if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
    return 'Run a workflow and return here to view its executions';
  }

  return `Use our API or add your first ${objectLabel} manually`;
};
