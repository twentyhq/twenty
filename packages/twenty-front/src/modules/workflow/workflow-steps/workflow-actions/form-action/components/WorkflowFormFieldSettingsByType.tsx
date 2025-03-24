import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { WorkflowFormFieldSettingsNumber } from './WorkflowFormFieldSettingsNumber';
import { WorkflowFormFieldSettingsText } from './WorkflowFormFieldSettingsText';
import { assertUnreachable } from 'twenty-shared/utils';
import { FieldMetadataType } from 'twenty-shared/types';

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
