import { CoreObjectNameSingular } from 'twenty-shared/types';

const HIDDEN_WORKSPACE_WORKFLOW_RUN_RELATION_FIELD_NAMES = [
  'workflow',
  'workflowVersion',
];

export const isHiddenWorkspaceWorkflowRunRelationField = ({
  objectNameSingular,
  fieldName,
  isWorkflowCoreIndexPageEnabled,
}: {
  objectNameSingular?: string | null;
  fieldName: string;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  isWorkflowCoreIndexPageEnabled &&
  objectNameSingular === CoreObjectNameSingular.WorkflowRun &&
  HIDDEN_WORKSPACE_WORKFLOW_RUN_RELATION_FIELD_NAMES.includes(fieldName);
