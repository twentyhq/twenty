import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { FieldMetadataType } from 'twenty-shared';
import { WorkflowFormFieldSettingsNumber } from './WorkflowFormFieldSettingsNumber';
import { WorkflowFormFieldSettingsText } from './WorkflowFormFieldSettingsText';

export const WorkflowFormFieldSettingsByType = ({
  field,
  onFieldUpdate,
}: {
  field: WorkflowFormActionField;
  onFieldUpdate: (id: string, field: string, value: any) => void;
}) => {
  switch (field.type) {
    case FieldMetadataType.TEXT:
      return (
        <WorkflowFormFieldSettingsText
          id={field.id}
          label={field.label}
          placeholder={field.placeholder}
          onFieldUpdate={(id, field, value) => {
            onFieldUpdate(id, field, value);
          }}
        />
      );
    case FieldMetadataType.NUMBER:
      return (
        <WorkflowFormFieldSettingsNumber
          id={field.id}
          label={field.label}
          placeholder={field.placeholder}
          onFieldUpdate={(id, field, value) => {
            onFieldUpdate(id, field, value);
          }}
        />
      );
    default:
      return null;
  }
};
