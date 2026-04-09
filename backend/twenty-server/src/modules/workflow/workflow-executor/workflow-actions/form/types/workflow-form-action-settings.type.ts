import { type WorkflowFormFieldType } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-field-type.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type FormFieldMetadata = {
  id: string;
  name: string;
  label: string;
  type: WorkflowFormFieldType;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  value?: any;
  placeholder?: string;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetadata[];
};
