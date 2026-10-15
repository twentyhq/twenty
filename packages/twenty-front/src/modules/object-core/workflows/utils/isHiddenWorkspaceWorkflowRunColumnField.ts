import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

export const isHiddenWorkspaceWorkflowRunColumnField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  fieldName !== 'workflow' &&
  isHiddenWorkspaceWorkflowRunRelationField({ objectNameSingular, fieldName });
