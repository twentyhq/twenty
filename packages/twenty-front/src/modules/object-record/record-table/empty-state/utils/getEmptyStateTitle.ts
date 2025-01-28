import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getEmptyStateTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkflowVersion) {
    return 'No workflow versions yet';
  }

  if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
    return 'No workflow runs yet';
  }

  return `Add your first ${objectLabel}`;
};
