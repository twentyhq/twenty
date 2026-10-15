import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

// The workflowRun.workflowVersion relation is meant to be removed, so its
// broken column stays out of the column pickers until then.
export const isHiddenWorkspaceWorkflowRunColumnField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  fieldName !== 'workflow' &&
  isHiddenWorkspaceWorkflowRunRelationField({ objectNameSingular, fieldName });
