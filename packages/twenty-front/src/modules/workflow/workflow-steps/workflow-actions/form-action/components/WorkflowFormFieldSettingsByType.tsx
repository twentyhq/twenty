import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { assertUnreachable, FieldMetadataType } from 'twenty-shared';
import { WorkflowFormFieldSettingsNumber } from './WorkflowFormFieldSettingsNumber';
import { WorkflowFormFieldSettingsText } from './WorkflowFormFieldSettingsText';

export const WorkflowFormFieldSettingsByType = ({
  field,
  onChange,
}: {
  field: WorkflowFormActionField;
  onChange: (fieldName: string, value: string | null) => void;
}) => {
  switch (field.type) {
    case FieldMetadataType.TEXT:
      return (
        <WorkflowFormFieldSettingsText
          label={field.label}
          placeholder={field.placeholder}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    case FieldMetadataType.NUMBER:
      return (
        <WorkflowFormFieldSettingsNumber
          label={field.label}
          placeholder={field.placeholder}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    default:
      return assertUnreachable(field.type, 'Unknown form field type');
  }
};
