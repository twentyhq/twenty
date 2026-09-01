import { CORE_WORKFLOW_FILTER_FIELDS } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';

export const findCoreWorkflowFilterField = (fieldKey: string | undefined) =>
  CORE_WORKFLOW_FILTER_FIELDS.find((field) => field.key === fieldKey);
