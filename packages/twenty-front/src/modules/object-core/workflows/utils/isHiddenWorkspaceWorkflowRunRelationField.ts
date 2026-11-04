import { StandardObjectNameSingular } from 'twenty-shared/types';

// Remove with the workspace workflowVersion object, once the core migration owns it.
const HIDDEN_WORKSPACE_WORKFLOW_RUN_RELATION_FIELD_NAMES = ['workflowVersion'];

export const isHiddenWorkspaceWorkflowRunRelationField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular?: string | null;
  fieldName: string;
}) =>
  objectNameSingular === StandardObjectNameSingular.WorkflowRun &&
  HIDDEN_WORKSPACE_WORKFLOW_RUN_RELATION_FIELD_NAMES.includes(fieldName);
