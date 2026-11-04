import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';

type WorkflowFormActionFieldSettings = {
  objectName?: string;
  selectType?: string;
  selectedFieldId?: string;
};

export type WorkflowFormActionField = {
  id: string;
  name: string;
  label: string;
  type: WorkflowFormFieldType;
  placeholder?: string;
  settings?: WorkflowFormActionFieldSettings;
  value?: any;
};
