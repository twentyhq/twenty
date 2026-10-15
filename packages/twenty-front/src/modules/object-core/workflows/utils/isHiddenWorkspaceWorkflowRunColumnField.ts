import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isHiddenWorkspaceWorkflowRunColumnField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  objectNameSingular === CoreObjectNameSingular.WorkflowRun &&
  fieldName === 'workflowVersion';
